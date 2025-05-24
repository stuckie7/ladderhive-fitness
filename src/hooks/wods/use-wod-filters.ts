
import { useState, useCallback } from 'react';
import { WodFilters } from '@/types/wod';

export const useWodFilters = () => {
  const [filters, setFilters] = useState<WodFilters>({});

  const applyFilters = useCallback((newFilters: WodFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    setFilters,
    applyFilters,
    resetFilters
  };
};
