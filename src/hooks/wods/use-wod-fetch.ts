
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Wod, WodFilters } from '@/types/wod';
import { parseWodComponents } from '@/utils/wodHelpers';

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
      if (filterOptions?.difficulty) {
        query = query.eq('difficulty', filterOptions.difficulty);
      }
      
      if (filterOptions?.category) {
        query = query.eq('category', filterOptions.category);
      }
      
      if (filterOptions?.duration) {
        query = query.lte('avg_duration_minutes', filterOptions.duration);
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
      
      // Map results and mark favorites, ensuring proper component type conversion
      const mappedWods: Wod[] = data?.map(wod => {
        // Safely parse components based on type
        const components = wod.components ? parseWodComponents(wod.components) : [];
        
        // Ensure video_url is properly extracted
        const videoUrl = wod.video_url || null;
        console.log(`WOD ${wod.id} video URL:`, videoUrl);
        
        return {
          ...wod,
          components,
          is_favorite: userFavorites.includes(wod.id),
          video_url: videoUrl
        };
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
      
      // Safely parse components based on type
      const components = data.components ? parseWodComponents(data.components) : [];
      
      // Ensure video_url is properly extracted
      const videoUrl = data.video_url || null;
      console.log("WOD video URL:", videoUrl);
      
      const wodWithTypedComponents: Wod = {
        ...data,
        components,
        is_favorite: isFavorite,
        video_url: videoUrl
      };
      
      return wodWithTypedComponents;
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
      
      // Convert data structure and ensure proper component types
      const favoriteWods: Wod[] = data
        .filter(item => item.wods)
        .map(item => {
          // Safely parse components based on type
          const components = item.wods.components ? parseWodComponents(item.wods.components) : [];
          
          return {
            ...item.wods,
            components,
            is_favorite: true
          };
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
