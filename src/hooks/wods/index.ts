
import { useState, useEffect, useCallback } from 'react';
import { useWodFilters } from './use-wod-filters';
import { useWodFetch } from './use-wod-fetch';
import { useWodFavorites } from './use-wod-favorites';
import { Wod } from '@/types/wod';

export const useWods = () => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [selectedWod, setSelectedWod] = useState<Wod | null>(null);
  const { filters, setFilters, applyFilters, resetFilters } = useWodFilters();
  const { isLoading, fetchWods, fetchWodById, getFavoriteWods } = useWodFetch();
  const { toggleFavorite } = useWodFavorites();

  // Wrapper for fetch wods that updates state
  const fetchAndSetWods = useCallback(async () => {
    const result = await fetchWods(filters);
    setWods(result);
  }, [fetchWods, filters]);
  
  // Wrapper for fetchWodById that updates state
  const fetchAndSetWodById = useCallback(async (id: string) => {
    const wod = await fetchWodById(id);
    if (wod) {
      setSelectedWod(wod);
    }
    return wod;
  }, [fetchWodById]);
  
  // Wrapper for getFavoriteWods that updates state
  const fetchAndSetFavorites = useCallback(async () => {
    const favorites = await getFavoriteWods();
    setWods(favorites);
  }, [getFavoriteWods]);
  
  // Wrapper for toggleFavorite that updates local state
  const toggleAndUpdateFavorite = useCallback(async (wodId: string) => {
    const newStatus = await toggleFavorite(wodId);
    
    // If the toggle operation was successful (not null), update local state
    if (newStatus !== null) {
      // Update wods list
      setWods(prev => prev.map(wod => 
        wod.id === wodId ? { ...wod, is_favorite: newStatus } : wod
      ));
      
      // Update selected wod if it matches
      if (selectedWod?.id === wodId) {
        setSelectedWod(prev => prev ? { ...prev, is_favorite: newStatus } : null);
      }
    }
    
    return newStatus;
  }, [toggleFavorite, selectedWod]);

  // Fetch wods on initial load
  useEffect(() => {
    fetchAndSetWods();
  }, [fetchAndSetWods]);

  return {
    wods,
    isLoading,
    selectedWod,
    filters,
    setFilters,
    resetFilters,
    fetchWods: fetchAndSetWods,
    fetchWodById: fetchAndSetWodById,
    toggleFavorite: toggleAndUpdateFavorite,
    getFavoriteWods: fetchAndSetFavorites
  };
};

// Re-export component hooks
export * from './use-wod-filters';
export * from './use-wod-fetch';
export * from './use-wod-favorites';
