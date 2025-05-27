
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface WodFilters {
  search: string;
  difficulty: string[];
  category: string[];
  duration: string[];
}

export interface Wod {
  id: string;
  name: string;
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
    duration: []
  });
  
  const itemsPerPage = 12;
  const { toast } = useToast();

  const buildQuery = () => {
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
    if (filters.category.length > 0) {
      query = query.in('category', filters.category);
    }

    // Apply duration filter
    if (filters.duration.length > 0) {
      const durationConditions = filters.duration.map(duration => {
        switch (duration) {
          case '<15min': return 'avg_duration_minutes.lt.15';
          case '15-30min': return 'avg_duration_minutes.gte.15,avg_duration_minutes.lte.30';
          case '30-45min': return 'avg_duration_minutes.gte.30,avg_duration_minutes.lte.45';
          case '45+min': return 'avg_duration_minutes.gte.45';
          default: return '';
        }
      }).filter(Boolean);
      
      if (durationConditions.length > 0) {
        query = query.or(durationConditions.join(','));
      }
    }

    // Apply pagination and ordering
    query = query
      .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
      .order('created_at', { ascending: false });

    return query;
  };

  const fetchWods = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = buildQuery();
      const { data, error, count } = await query;

      if (error) throw error;

      setWods(data || []);
      setTotalWods(count || 0);
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
  }, [filters, currentPage, toast]);

  useEffect(() => {
    fetchWods();
  }, [fetchWods]);

  const handleFilterChange = useCallback((newFilters: WodFilters) => {
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

  return {
    wods,
    totalWods,
    isLoading,
    currentPage,
    itemsPerPage,
    filters,
    handleFilterChange,
    handlePageChange,
    refreshWods
  };
};

export default useWodBrowser;
