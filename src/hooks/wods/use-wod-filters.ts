
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WodFilters } from '@/types/wod';

export const useWodFilters = () => {
  const [filters, setFilters] = useState<WodFilters>({});

  const applyFilters = useCallback((query: any, filterOptions?: WodFilters) => {
    let filteredQuery = query;
    
    // Apply filters if provided
    if (filterOptions?.difficulty) {
      filteredQuery = filteredQuery.eq('difficulty', filterOptions.difficulty);
    }
    
    if (filterOptions?.category) {
      filteredQuery = filteredQuery.eq('category', filterOptions.category);
    }
    
    if (filterOptions?.duration) {
      filteredQuery = filteredQuery.lte('avg_duration_minutes', filterOptions.duration);
    }
    
    return filteredQuery;
  }, []);

  return {
    filters,
    setFilters,
    applyFilters
  };
};
