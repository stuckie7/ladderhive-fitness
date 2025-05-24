import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Debug logging
const SUPABASE_URL = 'https://jrwyptpespjvjisrwnbh.supabase.co';
console.log('Supabase initialized with URL:', SUPABASE_URL);
import { WodFilters } from '@/types/wod';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export const useWodBrowser = () => {
  // State management
  const [wods, setWods] = useState<any[]>([]);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Simple toast wrapper to avoid errors
  const showError = useCallback((message: string) => {
    console.error('WOD Browser Error:', message);
    try {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Failed to show toast:', error);
    }
  }, [toast]);

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
      q = q.textSearch('title', filters.search, {
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
      // Handle duration as a range in minutes
      const maxDuration = parseInt(filters.duration[0], 10);
      if (!isNaN(maxDuration)) {
        q = q.lte('duration_minutes', maxDuration);
      }
    }

    // Apply equipment filters
    if (filters.equipment.length > 0) {
      // For each equipment, add a condition that checks if equipment_needed contains the equipment
      filters.equipment.forEach(equip => {
        q = q.contains('equipment_needed', [equip]);
      });
    }

    // Special filters
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

  // Enhanced logging for debugging
  const logQueryDetails = useCallback((query: any, type: 'count' | 'data') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${type.toUpperCase()}] Current query:`, {
        filters,
        currentPage,
        query: query.toPostgrestFilter()
      });
    }
  }, [filters, currentPage]);

  // Fetch wods based on current filters and pagination
  const fetchWods = useCallback(async () => {
    setIsLoading(true);
    console.log("Fetching wods with filters:", filters);
    console.log("Supabase URL:", SUPABASE_URL);
    console.log("Supabase client initialized:", !!supabase);
    
    // No need to dismiss previous toasts, they'll auto-dismiss
    
    try {
      let userId: string | null = null;
      const savedFilter = filters.special.includes('Favorites');
      
      // Handle favorites filter
      if (savedFilter) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // If user is not logged in but Favorites filter is selected, return empty results
          setWods([]);
          setTotalWods(0);
          setIsLoading(false);
          return;
        }
        userId = user.id;
      }
      
      // Build base query
      let query = supabase
        .from('wods')
        .select('*', { count: 'exact' });
      
      // Apply filters to the query
      query = buildQuery(query);
      
      // Handle favorites query
      if (savedFilter && userId) {
        const { data: favoriteWods, error: favError } = await supabase
          .from('user_favorite_wods')
          .select('wod_id')
          .eq('user_id', userId);
          
        if (favError) throw favError;
        
        const favoriteWodIds = favoriteWods.map(fw => fw.wod_id);
        
        if (favoriteWodIds.length === 0) {
          setWods([]);
          setTotalWods(0);
          setIsLoading(false);
          return;
        }
        
        // Apply favorite wod IDs filter
        query = query.in('id', favoriteWodIds);
      }
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Get favorite WODs for the current user to mark them in the results
      let favoriteWodIds: string[] = [];
      if (userId) {
        const { data: favoriteWods } = await supabase
          .from('user_favorite_wods')
          .select('wod_id')
          .eq('user_id', userId);
        
        if (favoriteWods) {
          favoriteWodIds = favoriteWods.map(fw => fw.wod_id);
        }
      }
      
      // Process the data
      const processedWods = (data || []).map(wod => ({
        ...wod,
        is_new: new Date(wod.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
        is_favorite: favoriteWodIds.includes(wod.id)
      }));
      
      setWods(processedWods);
      setTotalWods(count || 0);
      
    } catch (error) {
      console.error('Error fetching WODs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workouts';
      showError(errorMessage);
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
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category')?.split(',') || [];
    const difficulty = searchParams.get('difficulty')?.split(',') || [];
    
    let newFilters = { ...filters };
    
    if (search) newFilters.search = search;
    if (category.length > 0) newFilters.category = category;
    if (difficulty.length > 0) newFilters.difficulty = difficulty;
    
    // Only update if filters are different
    const hasChanged = 
      newFilters.search !== filters.search || 
      JSON.stringify(newFilters.category) !== JSON.stringify(filters.category) ||
      JSON.stringify(newFilters.difficulty) !== JSON.stringify(filters.difficulty);
    
    if (hasChanged) {
      setFilters(newFilters);
    }
  }, [searchParams, filters]);

  // Apply filters
  const handleFilterChange = useCallback((newFilters: WodFilters) => {
    setFilters(prevFilters => {
      // Only update if there are actual changes to prevent unnecessary re-renders
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      return prevFilters;
    });
    
    // Update URL params for deep linking
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category.length > 0) params.set('category', newFilters.category.join(','));
    if (newFilters.difficulty.length > 0) params.set('difficulty', newFilters.difficulty.join(','));
    
    setSearchParams(params);
  }, [setSearchParams]);

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll back to top
  };

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
    setSearchParams({});
  }, [setSearchParams]);

  return {
    wods,
    totalWods,
    isLoading,
    currentPage,
    itemsPerPage, 
    filters,
    handleFilterChange,
    handlePageChange,
    activeFilterCount,
    resetFilters
  };
};
