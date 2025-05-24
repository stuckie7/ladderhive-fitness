
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WodFilters } from '@/types/wod';

export const useWodFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL or use defaults
  const getInitialFilters = (): WodFilters => {
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

  const [filters, setFilters] = useState<WodFilters>(getInitialFilters());

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value && typeof value === 'string' && value.length > 0) {
        params.set(key, value);
      }
    });
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const applyFilters = useCallback((newFilters: Partial<WodFilters>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      
      // Only update if there are actual changes
      if (JSON.stringify(updatedFilters) !== JSON.stringify(prevFilters)) {
        return updatedFilters;
      }
      return prevFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
<<<<<<< HEAD
    setFilters({
      search: '',
      difficulty: [],
      category: [],
      duration: [],
      equipment: [],
      special: []
    });
  }, []);

  // Calculate active filter count for the badge
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'search' && value) return count + 1;
    if (Array.isArray(value)) return count + value.length;
    return count;
  }, 0);

=======
    setFilters({});
  }, []);

>>>>>>> c57dc56863e7fe2b8ce70ae08fe202abf8951f15
  return {
    filters,
    setFilters,
    applyFilters,
<<<<<<< HEAD
    resetFilters,
    activeFilterCount
=======
    resetFilters
>>>>>>> c57dc56863e7fe2b8ce70ae08fe202abf8951f15
  };
};
