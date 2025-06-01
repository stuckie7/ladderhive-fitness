
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

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      query = query.in('difficulty', filters.difficulty);
    }

    // Apply category filter
    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }

    // Apply duration filter - fixed logic
    if (filters.duration && filters.duration.length > 0) {
      const durationQueries: string[] = [];
      
      filters.duration.forEach(duration => {
        switch (duration) {
          case '<15min':
            durationQueries.push('avg_duration_minutes.lt.15');
            break;
          case '15-30min':
            durationQueries.push('and(avg_duration_minutes.gte.15,avg_duration_minutes.lte.30)');
            break;
          case '30-45min':
            durationQueries.push('and(avg_duration_minutes.gte.30,avg_duration_minutes.lte.45)');
            break;
          case '45+min':
            durationQueries.push('avg_duration_minutes.gte.45');
            break;
        }
      });
      
      if (durationQueries.length > 0) {
        query = query.or(durationQueries.join(','));
      }
    }

    // Apply special filters
    if (filters.special && filters.special.length > 0) {
      filters.special.forEach(special => {
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
