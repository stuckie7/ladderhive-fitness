
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Wod, WodFilters } from '@/types/wod';

export const useWodBrowser = () => {
  // State management
  const [wods, setWods] = useState<Wod[]>([]);
  const [totalWods, setTotalWods] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<WodFilters>({
    search: '',
    difficulty: [],
    category: [],
    duration: [],
    equipment: [],
    special: []
  });
  const itemsPerPage = 12;
  const location = useLocation();
  const { toast } = useToast();

  // Calculate active filter count for the badge
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'search' && value) return count + 1;
    if (Array.isArray(value)) return count + value.length;
    return count;
  }, 0);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Build query based on filters
  const buildQuery = (query: PostgrestFilterBuilder<any, any, any[]>) => {
    let q = query;
    console.log("Building query with filters:", filters);
    
    // Apply search filter
    if (filters.search) {
      q = q.textSearch('name', filters.search, {
        config: 'english',
        type: 'websearch'
      });
    }

    // Apply difficulty filters
    if (filters.difficulty.length > 0) {
      q = q.in('difficulty', filters.difficulty);
    }

    // Apply category filters
    if (filters.category.length > 0) {
      q = q.in('category', filters.category);
    }

    // Apply duration filters
    if (filters.duration.length > 0) {
      // Translate duration strings to minute ranges
      const durationRanges = filters.duration.map(duration => {
        switch (duration) {
          case '<15min': return { min: 0, max: 15 };
          case '15-30min': return { min: 15, max: 30 };
          case '30-45min': return { min: 30, max: 45 };
          case '45+min': return { min: 45, max: 999 };
          default: return null;
        }
      }).filter(Boolean) as Array<{min: number, max: number}>;
      
      if (durationRanges.length > 0) {
        // Apply each duration range as an OR condition
        const durationConditions = durationRanges.map(range => 
          `avg_duration_minutes.gte.${range.min}.and.avg_duration_minutes.lte.${range.max}`
        );
        
        q = q.or(durationConditions.join(','));
      }
    }

    // Apply equipment filters
    if (filters.equipment.length > 0) {
      // For each equipment, add a condition that checks for equipment in description
      const equipmentConditions = filters.equipment.map(equip => 
        `description.ilike.%${equip}%`
      );
      
      // If multiple equipment are selected, we want to match ANY of them
      q = q.or(equipmentConditions.join(','));
    }

    // Special filters
    if (filters.special.includes('With Videos')) {
      q = q.not('video_url', 'is', null);
    }
    
    if (filters.special.includes('New This Week')) {
      // Filter for wods created in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      q = q.gte('created_at', lastWeek.toISOString());
    }

    // Apply pagination
    q = q
      .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
      .order('created_at', { ascending: false });

    return q;
  };

  // Fetch wods based on current filters and pagination
  const fetchWods = useCallback(async () => {
    setIsLoading(true);
    console.log("Fetching wods with filters:", filters);
    
    try {
      // Get user ID for favorites
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Build base query
      let query = supabase
        .from('wods')
        .select('*', { count: 'exact' });
      
      // Apply filters to the query
      query = buildQuery(query);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Get favorite WODs if user is logged in
      let favorites: Record<string, boolean> = {};
      if (userId) {
        const { data: favs, error: favError } = await supabase
          .from('user_favorite_wods')
          .select('wod_id')
          .eq('user_id', userId);
          
        if (!favError && favs) {
          favorites = favs.reduce((acc, fav) => {
            acc[fav.wod_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }
      
      // Process the data
      const processedWods = (data || []).map(wod => ({
        ...wod,
        is_favorite: favorites[wod.id] || false,
        is_new: new Date(wod.created_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      })) as Wod[];
      
      setWods(processedWods);
      setTotalWods(count || 0);
      
    } catch (error) {
      console.error('Error fetching wods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WODs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, toast]);

  // Initial load and filter changes
  useEffect(() => {
    fetchWods();
  }, [fetchWods]);

  // Handle URL parameters for deep linking
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    
    let newFilters = { ...filters };
    
    if (searchQuery) newFilters.search = searchQuery;
    if (category) newFilters.category = [category];
    if (difficulty) newFilters.difficulty = [difficulty];
    
    // Only update if filters are different
    const hasChanged = 
      newFilters.search !== filters.search || 
      JSON.stringify(newFilters.category) !== JSON.stringify(filters.category) ||
      JSON.stringify(newFilters.difficulty) !== JSON.stringify(filters.difficulty);
    
    if (hasChanged) {
      setFilters(newFilters);
    }
  }, [location, filters]);

  // Apply filters
  const handleFilterChange = useCallback((newFilters: WodFilters) => {
    setFilters(prevFilters => {
      // Only update if there are actual changes to prevent unnecessary re-renders
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      return prevFilters;
    });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      difficulty: [],
      category: [],
      duration: [],
      equipment: [],
      special: []
    });
  }, []);

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll back to top
  };

  return {
    wods,
    totalWods,
    isLoading,
    currentPage,
    itemsPerPage, 
    filters,
    activeFilterCount,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  };
};
