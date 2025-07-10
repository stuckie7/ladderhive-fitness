import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useFavoritesOptimized = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load all favorite IDs at once
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorite_wods')
        .select('wod_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const ids = new Set(data.map(item => item.wod_id));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (wodId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save favorites',
        variant: 'destructive',
      });
      return false;
    }

    const isFavorited = favoriteIds.has(wodId);
    
    try {
      if (isFavorited) {
        await supabase
          .from('user_favorite_wods')
          .delete()
          .eq('user_id', user.id)
          .eq('wod_id', wodId);
      } else {
        await supabase
          .from('user_favorite_wods')
          .insert([{ user_id: user.id, wod_id: wodId }]);
      }

      // Optimistically update the UI
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.delete(wodId);
        } else {
          newSet.add(wodId);
        }
        return newSet;
      });

      return !isFavorited;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite',
        variant: 'destructive',
      });
      return isFavorited;
    }
  }, [user, favoriteIds, toast]);

  // Check if a WOD is favorited
  const isFavorite = useCallback((wodId: string) => {
    return favoriteIds.has(wodId);
  }, [favoriteIds]);

  // Filter WODs to only those that are favorited
  const filterFavorites = useCallback((wods: any[]) => {
    return wods.filter(wod => favoriteIds.has(wod.id));
  }, [favoriteIds]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    isFavorite,
    toggleFavorite,
    filterFavorites,
    isLoading,
    refreshFavorites: loadFavorites,
  };
};
