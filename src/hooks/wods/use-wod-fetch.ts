
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Wod, WodFilters } from '@/types/wod';
import { parseWodComponents, standardizeWodData } from '@/utils/wodHelpers';

export const useWodFetch = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchWods = useCallback(async (filterOptions?: WodFilters) => {
    setIsLoading(true);
    try {
      console.log("Fetching WODs with filters:", filterOptions);
      let query = supabase.from('wods').select('*');
      
      // Apply filters
      if (filterOptions?.difficulty && filterOptions.difficulty.length > 0) {
        query = query.eq('difficulty', filterOptions.difficulty[0]);
      }
      
      if (filterOptions?.category && filterOptions.category.length > 0) {
        query = query.eq('category', filterOptions.category[0]);
      }
      
      if (filterOptions?.duration && filterOptions.duration.length > 0) {
        const durationValue = parseInt(filterOptions.duration[0], 10);
        if (!isNaN(durationValue)) {
          query = query.lte('avg_duration_minutes', durationValue);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("Raw WOD data:", data);
      
      // If user is logged in, fetch their favorites
      let userFavorites: string[] = [];
      if (user) {
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('user_favorite_wods')
          .select('wod_id')
          .eq('user_id', user.id);
        
        if (!favoritesError && favoritesData) {
          userFavorites = favoritesData.map(fav => fav.wod_id);
        }
      }
      
      // Map results and mark favorites, ensuring proper component type conversion and standardization
      const mappedWods: Wod[] = data?.map(wod => {
        // Use the standardize function to ensure all fields match our Wod interface
        return standardizeWodData({
          ...wod,
          is_favorite: userFavorites.includes(wod.id)
        });
      }) || [];
      
      return mappedWods;
      
    } catch (error: any) {
      console.error("Error fetching wods:", error);
      toast({
        title: "Error",
        description: "Failed to load workouts of the day",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const fetchWodById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Fetching WOD by ID:", id);
      const { data, error } = await supabase
        .from('wods')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      console.log("Raw WOD data by ID:", data);
      
      // Check if user has favorited this WOD
      let isFavorite = false;
      if (user) {
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('user_favorite_wods')
          .select('*')
          .eq('user_id', user.id)
          .eq('wod_id', id)
          .single();
        
        isFavorite = !favoriteError && !!favoriteData;
      }
      
      // Standardize data to ensure it matches our Wod interface
      return standardizeWodData({
        ...data,
        is_favorite: isFavorite
      });
    } catch (error: any) {
      console.error("Error fetching wod:", error);
      toast({
        title: "Error",
        description: "Failed to load workout details",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const getFavoriteWods = useCallback(async () => {
    if (!user) {
      return [];
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorite_wods')
        .select('wod_id, wods(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Convert and standardize data structure to ensure proper types
      const favoriteWods: Wod[] = data
        .filter(item => item.wods) // Filter out any potentially null items
        .map(item => {
          const wodData = item.wods as any; // Cast to any first for safer access
          
          // Use standardize function to ensure correct format
          return standardizeWodData({
            ...wodData,
            is_favorite: true
          });
        });
      
      return favoriteWods;
    } catch (error: any) {
      console.error("Error fetching favorite wods:", error);
      toast({
        title: "Error",
        description: "Failed to load favorite workouts",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    isLoading,
    fetchWods,
    fetchWodById,
    getFavoriteWods
  };
};
