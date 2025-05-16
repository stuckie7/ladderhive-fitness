
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const buildQuery = (query: any) => {
    // Apply search filter
    if (filters.search) {
      query = query.textSearch('title', filters.search, {
        config: 'english'
      });
    }

    // Apply difficulty filters
    if (filters.difficulty.length > 0) {
      query = query.in('difficulty', filters.difficulty);
    }

    // Apply focus area/category filters
    if (filters.focusArea.length > 0) {
      query = query.in('category', filters.focusArea);
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
      }).filter(Boolean);
      
      if (durationRanges.length > 0) {
        // Apply each duration range as an OR condition
        const durationConditions = durationRanges.map(range => 
          `duration_minutes.gte.${range!.min}.and.duration_minutes.lte.${range!.max}`
        );
        
        query = query.or(durationConditions.join(','));
      }
    }

    // Special filters
    if (filters.special.includes('New This Week')) {
      // Filter for workouts created in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query = query.gte('created_at', lastWeek.toISOString());
    }

    // Apply pagination
    query = query
      .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
      .order('created_at', { ascending: false });

    return query;
  };

  // Fetch workouts based on current filters and pagination
  const fetchWorkouts = async () => {
    setIsLoading(true);
    
    try {
      // Count total workouts with current filters (without pagination)
      let countQuery = supabase.from('prepared_workouts').select('id', { count: 'exact' });
      countQuery = buildQuery(countQuery);
      
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      setTotalWorkouts(count || 0);
      
      // Fetch workouts with pagination
      let query = supabase.from('prepared_workouts').select(`
        id, title, description, duration_minutes, difficulty, category, 
        created_at, thumbnail_url, video_url, short_description
      `);
      
      query = buildQuery(query);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
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

  // Apply filters
  const handleFilterChange = (newFilters: WorkoutFilters) => {
    setFilters(newFilters);
  };

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
