import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Wod, WodFilters } from '@/types/wod';

const ITEMS_PER_PAGE = 12;

export const useWodBrowser = () => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [totalWods, setTotalWods] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Parse filters from URL
  const getFiltersFromUrl = (): WodFilters => {
    const params = Object.fromEntries(searchParams.entries());
    
    return {
      search: params.search || '',
      difficulty: params.difficulty ? params.difficulty.split(',') : [],
      category: params.category ? params.category.split(',') : [],
      duration: params.duration ? params.duration.split(',') : [],
      equipment: params.equipment ? params.equipment.split(',') : [],
      special: params.special ? params.special.split(',') : []
    };
  };

  const [filters, setFilters] = useState<WodFilters>(getFiltersFromUrl());

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Build query based on filters
  const buildQuery = (query: any) => {
    let q = query;
    
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


    // Special filters
    if (filters.special.includes('With Videos')) {
      q = q.not('video_url', 'is', null);
    }
    
    if (filters.special.includes('New This Week')) {
      // Filter for WODs created in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      q = q.gte('created_at', lastWeek.toISOString());
    }
    
    if (filters.special.includes('Saved')) {
      // This will be handled in the fetchWods function
      q = q.select('*, user_saved_wods!left(user_id)');
    }

    return q;
  };

  // Enhanced logging for debugging
  const logQueryDetails = useCallback((query: any, type: 'count' | 'data') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WODS ${type.toUpperCase()}] Current query:`, {
        filters,
        currentPage,
        query: query.toPostgrestFilter ? query.toPostgrestFilter() : query
      });
    }
  }, [filters, currentPage]);

  // Fetch WODs based on current filters and pagination
  const fetchWods = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // First, check if we need to handle the Saved filter
      let userId: string | null = null;
      if (filters.special.includes('Saved')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // If user is not logged in but Saved filter is selected, return empty results
          setWods([]);
          setTotalWods(0);
          setIsLoading(false);
          return;
        }
        userId = user.id;
      }
      
      // Build base query for counting
      let countQuery = supabase
        .from('wods')
        .select('id', { count: 'exact', head: true });
      
      // Apply filters to count query
      countQuery = buildQuery(countQuery);
      
      // Apply Saved filter to count query if needed
      if (userId) {
        countQuery = countQuery.eq('user_saved_wods.user_id', userId);
      }
      
      logQueryDetails(countQuery, 'count');
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error in WOD count query:', countError);
        throw countError;
      }
      
      setTotalWods(count || 0);
      
      // Build main query for fetching data
      let query = supabase
        .from('wods')
        .select(`
          id, 
          name, 
          description, 
          avg_duration_minutes, 
          difficulty, 
          category, 
          created_at, 
          video_url,
          video_demo,
          user_saved_wods!left(user_id)
        `);
      
      // Apply filters to main query
      query = buildQuery(query);
      
      // Apply Saved filter to main query if needed
      if (userId) {
        query = query.eq('user_saved_wods.user_id', userId);
      }
      
      // Apply pagination
      query = query
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });
      
      logQueryDetails(query, 'data');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error in WOD data query:', error);
        throw error;
      }
      
      // Process the results to match expected format
      const processedWods = data?.map(wod => {
        // Create a base WOD object with required fields
        const baseWod: Wod & { 
          title?: string;
          duration?: number;
        } = {
          id: wod.id || '',
          name: wod.name || '',
          description: wod.description || '',
          components: [], // Initialize with empty array, will be populated if available
          video_url: wod.video_url || null,
          video_demo: wod.video_demo || null,
          category: wod.category || null,
          difficulty: wod.difficulty || null,
          avg_duration_minutes: wod.avg_duration_minutes || 30,
          created_at: wod.created_at || new Date().toISOString(),
          is_favorite: !!wod.user_saved_wods?.[0]?.user_id,
          // Additional fields for compatibility
          title: wod.name || '',
          duration: wod.avg_duration_minutes || 30,
        };

        // Add parts if they exist in the wod object
        const partFields = ['part_1', 'part_2', 'part_3', 'part_4', 'part_5', 
                           'part_6', 'part_7', 'part_8', 'part_9', 'part_10'] as const;
        
        partFields.forEach(part => {
          if (part in wod) {
            (baseWod as any)[part] = (wod as any)[part] || null;
          }
        });

        return baseWod;
      }) || [];
      
      setWods(processedWods);
    } catch (error) {
      console.error('Error fetching WODs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WODs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, logQueryDetails, toast]);

  // Initial load and filter changes
  useEffect(() => {
    fetchWods();
  }, [fetchWods]);

  // Update filters when URL changes
  useEffect(() => {
    setFilters(getFiltersFromUrl());
  }, [searchParams]);

  // Apply filters with debounce to prevent excessive queries
  const handleFilterChange = useCallback((newFilters: Partial<WodFilters>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      
      // Only update if there are actual changes to prevent unnecessary re-renders
      if (JSON.stringify(updatedFilters) !== JSON.stringify(prevFilters)) {
        return updatedFilters;
      }
      return prevFilters;
    });
  }, []);

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll back to top
  };

  // Calculate active filter count for the badge
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'search' && value) return count + 1;
    if (Array.isArray(value)) return count + value.length;
    return count;
  }, 0);

  return {
    wods,
    totalWods,
    isLoading,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    filters,
    handleFilterChange,
    handlePageChange,
    activeFilterCount,
    resetFilters: () => {
      setFilters({
        search: '',
        difficulty: [],
        category: [],
        duration: [],
        equipment: [],
        special: []
      });
    }
  };
};

export default useWodBrowser;
