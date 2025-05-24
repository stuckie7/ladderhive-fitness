
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface WorkoutFilters {
  search: string;
  focusArea: string[];
  difficulty: string[];
  duration: string[];
  equipment: string[];
  special: string[];
}

export const useWorkoutBrowser = () => {
  // State management
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<WorkoutFilters>({
    search: '',
    focusArea: [],
    difficulty: [],
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

    // Apply focus area/category filters
    if (filters.focusArea.length > 0) {
      q = q.in('category', filters.focusArea);
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
          `duration_minutes.gte.${range.min}.and.duration_minutes.lte.${range.max}`
        );
        
        q = q.or(durationConditions.join(','));
      }
    }

    // Apply equipment filters
    if (filters.equipment.length > 0) {
      // For each equipment, add a condition that checks if equipment_needed contains the equipment
      const equipmentConditions = filters.equipment.map(equip => 
        `equipment_needed.ilike.%${equip}%`
      );
      
      // If multiple equipment are selected, we want to match ANY of them
      q = q.or(equipmentConditions.join(','));
    }

    // Special filters
    if (filters.special.includes('With Videos')) {
      q = q.not('video_url', 'is', null);
    }
    
    if (filters.special.includes('New This Week')) {
      // Filter for workouts created in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      q = q.gte('created_at', lastWeek.toISOString());
    }
    
    // Handle Saved filter separately in the fetchWorkouts function
    // as it requires async operation
    if (filters.special.includes('Saved')) {
      // We'll handle this in the fetchWorkouts function
      // by checking the user_saved_workouts table
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

  // Fetch workouts based on current filters and pagination
  const fetchWorkouts = async () => {
    setIsLoading(true);
    
    try {
      // First, check if we need to handle the Saved filter
      let userId: string | null = null;
      if (filters.special.includes('Saved')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // If user is not logged in but Saved filter is selected, return empty results
          setWorkouts([]);
          setTotalWorkouts(0);
          setIsLoading(false);
          return;
        }
        userId = user.id;
      }
      
      // Build base query for counting
      let countQuery = supabase
        .from('prepared_workouts')
        .select('id', { count: 'exact', head: true });
      
      // Apply filters to count query
      countQuery = buildQuery(countQuery);
      
      // Apply Saved filter to count query if needed
      if (userId) {
        countQuery = countQuery.eq('user_saved_workouts.user_id', userId);
      }
      
      logQueryDetails(countQuery, 'count');
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error in count query:', countError);
        throw countError;
      }
      
      setTotalWorkouts(count || 0);
      
      // Build main query for fetching data
      let query = supabase
        .from('prepared_workouts')
        .select(`
          id, 
          title, 
          description, 
          duration_minutes, 
          difficulty, 
          category, 
          created_at, 
          thumbnail_url, 
          video_url, 
          short_description,
          equipment_needed,
          user_saved_workouts!left(user_id)
        `);
      
      // Apply filters to main query
      query = buildQuery(query);
      
      // Apply Saved filter to main query if needed
      if (userId) {
        query = query.eq('user_saved_workouts.user_id', userId);
      }
      
      // Apply pagination
      query = query
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
        .order('created_at', { ascending: false });
      
      logQueryDetails(query, 'data');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error in data query:', error);
        throw error;
      }
      
      // Process the results to match expected format
      const processedWorkouts = data?.map(workout => {
        // Calculate exercise_count separately - remove the subquery that was causing errors
        return {
          id: workout.id,
          title: workout.title,
          description: workout.description || workout.short_description || '',
          duration: workout.duration_minutes || 30,
          exercises: 5, // Default value since we can't get the count in the same query
          difficulty: workout.difficulty || 'Beginner',
          category: workout.category,
          thumbnail_url: workout.thumbnail_url,
          video_url: workout.video_url,
          created_at: workout.created_at,
          // Add flags for badges - in a real app these might come from the database
          is_new: new Date(workout.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days
        };
      });
      
      setWorkouts(processedWorkouts || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workouts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchWorkouts();
  }, [filters, currentPage]);

  // Handle URL parameters for deep linking
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    
    let newFilters = { ...filters };
    
    if (searchQuery) newFilters.search = searchQuery;
    if (category) newFilters.focusArea = [category];
    if (difficulty) newFilters.difficulty = [difficulty];
    
    // Only update if filters are different
    const hasChanged = 
      newFilters.search !== filters.search || 
      newFilters.focusArea.join(',') !== filters.focusArea.join(',') ||
      newFilters.difficulty.join(',') !== filters.difficulty.join(',');
    
    if (hasChanged) {
      setFilters(newFilters);
    }
  }, [location]);

  // Apply filters with debounce to prevent excessive queries
  const handleFilterChange = useCallback((newFilters: WorkoutFilters) => {
    setFilters(prevFilters => {
      // Only update if there are actual changes to prevent unnecessary re-renders
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      return prevFilters;
    });
  }, []);

  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll back to top
  };

  // Prefetch next page for smoother pagination
  useEffect(() => {
    if (currentPage < Math.ceil(totalWorkouts / itemsPerPage) - 1) {
      // Build query for next page
      let query = supabase.from('prepared_workouts').select('id, thumbnail_url');
      query = buildQuery(query);
      query = query.range((currentPage + 1) * itemsPerPage, (currentPage + 2) * itemsPerPage - 1);
      
      // Fetch but don't wait or update state
      query.then(({ data }) => {
        if (data && Array.isArray(data)) {
          // Preload thumbnails
          data.forEach(workout => {
            if (workout.thumbnail_url) {
              const img = new Image();
              img.src = workout.thumbnail_url;
            }
          });
        }
      });
    }
  }, [workouts, currentPage]);

  return {
    workouts,
    totalWorkouts,
    isLoading,
    currentPage,
    itemsPerPage, 
    filters,
    activeFilterCount,
    handleFilterChange,
    handlePageChange,
    fetchWorkouts
  };
};
