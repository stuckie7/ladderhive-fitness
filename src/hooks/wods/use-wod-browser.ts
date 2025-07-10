
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface WodFilters {
  search: string;
  difficulty: string[];
  category: string[];
  duration: string[];
  equipment?: string[];  // Made optional
  special: string[];
}

export interface Wod {
  id: string;
  name: string;
  title: string; // Adding title property for compatibility
  description: string;
  difficulty: string;
  category: string;
  avg_duration_minutes: number;
  components: any;
  video_demo?: string;
  created_at: string;
}

interface UseWodBrowserReturn {
  wods: Wod[];
  totalWods: number;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  filters: WodFilters;
  handleFilterChange: (newFilters: WodFilters) => void;
  handlePageChange: (page: number) => void;
  refreshWods: () => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

export const useWodBrowser = (): UseWodBrowserReturn => {
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
  const { toast } = useToast();

  const buildQuery = useCallback(() => {
    let query = supabase
      .from('wods')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply difficulty filter - Fixed to match database values
    if (filters.difficulty.length > 0) {
      // Map display names to database values
      const dbDifficultyValues = filters.difficulty.map(difficulty => {
        switch (difficulty) {
          case 'Beginner':
            return 'Beginner';
          case 'Intermediate':
            return 'Intermediate';
          case 'Advanced':
            return 'Advanced';
          case 'Elite':
            return 'Elite';
          default:
            return difficulty.toLowerCase(); // fallback to lowercase for any other values
        }
      });
      
      console.log('Difficulty filter - Display values:', filters.difficulty);
      console.log('Difficulty filter - DB values:', dbDifficultyValues);
      
      query = query.in('difficulty', dbDifficultyValues);
    }

    // Apply category filter - Fixed to match database values
    if (filters.category && filters.category.length > 0) {
      // Map display names to database values
      const dbCategoryValues = filters.category.map(category => {
        switch (category) {
          case 'Girl WODs':
            return 'Girl';
          case 'Hero WODs':
            return 'Hero';
          case 'Benchmark':
            return 'Benchmark';
          case 'AMRAP':
            return 'AMRAP';
          case 'EMOM':
            return 'EMOM';
          case 'For Time':
            return 'For Time';
          case 'Chipper':
            return 'Chipper';
          case 'Ladder':
            return 'Ladder';
          default:
            return category;
        }
      });
      
      console.log('Category filter - Display values:', filters.category);
      console.log('Category filter - DB values:', dbCategoryValues);
      
      query = query.in('category', dbCategoryValues);
    }

    // Apply duration filter - Fixed to properly handle duration ranges
    if (filters.duration && filters.duration.length > 0) {
      const durationConditions: string[] = [];
      
      filters.duration.forEach(duration => {
        switch (duration) {
          case '<15min':
            durationConditions.push('avg_duration_minutes.lt.15');
            break;
          case '15-30min':
            durationConditions.push('and(avg_duration_minutes.gte.15,avg_duration_minutes.lte.30)');
            break;
          case '30-45min':
            durationConditions.push('and(avg_duration_minutes.gte.30,avg_duration_minutes.lte.45)');
            break;
          case '45+min':
            durationConditions.push('avg_duration_minutes.gte.45');
            break;
        }
      });
      
      console.log('Duration filter - Display values:', filters.duration);
      console.log('Duration filter - Query conditions:', durationConditions);
      
      if (durationConditions.length > 0) {
        query = query.or(durationConditions.join(','));
      }
    }

    // Apply special filters - Fixed to properly handle special cases
    if (filters.special && filters.special.length > 0) {
      filters.special.forEach(special => {
        console.log('Processing special filter:', special);
        
        switch (special) {
          case 'With Videos':
            query = query.not('video_demo', 'is', null);
            break;
          case 'New This Week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query = query.gte('created_at', oneWeekAgo.toISOString());
            break;
          // 'Saved' filter is handled client-side in the Wods component
          default:
            break;
        }
      });
      
      console.log('Special filters applied:', filters.special);
    }

    // Apply pagination and ordering
    query = query
      .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
      .order('created_at', { ascending: false });

    return query;
  }, [filters, currentPage, itemsPerPage]);

  const fetchWods = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = buildQuery();
      console.log('Executing WODs query with filters:', filters);
      
      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Map the data to include title property for compatibility
      const mappedWods = data?.map(wod => ({
        ...wod,
        title: wod.name // Use name as title for compatibility
      })) || [];

      console.log('Fetched WODs:', mappedWods);
      console.log('Total count:', count);
      setWods(mappedWods);
      setTotalWods(count || 0);
    } catch (error) {
      console.error('Error fetching WODs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load WODs. Please try again.',
        variant: 'destructive',
      });
      setWods([]);
      setTotalWods(0);
    } finally {
      setIsLoading(false);
    }
  }, [buildQuery, toast]);

  useEffect(() => {
    fetchWods();
  }, [fetchWods]);

  const handleFilterChange = useCallback((newFilters: WodFilters) => {
    console.log('Filter change:', newFilters);
    setFilters(newFilters);
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const refreshWods = useCallback(() => {
    fetchWods();
  }, [fetchWods]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      difficulty: [],
      category: [],
      duration: [],
      equipment: [],
      special: []
    });
    setCurrentPage(0);
  }, []);

  // Calculate active filter count
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
    itemsPerPage,
    filters,
    handleFilterChange,
    handlePageChange,
    refreshWods,
    activeFilterCount,
    resetFilters
  };
};

export default useWodBrowser;
