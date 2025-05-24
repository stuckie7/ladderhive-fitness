
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
        
        // Ensure video URLs are properly extracted
        // Use video_demo for compatibility with existing data
        const videoUrl = wod.video_demo || null;
        
        return {
          ...wod,
          components,
          is_favorite: userFavorites.includes(wod.id),
          video_url: videoUrl // Set video_url to the value from video_demo for compatibility
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
      
      // Ensure video URLs are properly extracted
      // Use video_demo for compatibility with existing data
      const videoUrl = data.video_demo || null;
      
      const wodWithTypedComponents: Wod = {
        ...data,
        components,
        is_favorite: isFavorite,
        video_url: videoUrl // Set video_url to the value from video_demo for compatibility
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
        .filter(item => item.wods) // Filter out any potentially null items
        .map(item => {
          const wodData = item.wods as any; // Cast to any first for safer access
          
          // Safely parse components based on type
          const components = wodData.components ? parseWodComponents(wodData.components) : [];
          
          return {
            id: wodData.id,
            name: wodData.name,
            description: wodData.description,
            components,
            is_favorite: true,
            video_url: wodData.video_demo || null,
            video_demo: wodData.video_demo || null,
            category: wodData.category || null,
            difficulty: wodData.difficulty || null,
            avg_duration_minutes: wodData.avg_duration_minutes || null,
            created_at: wodData.created_at || null,
            part_1: wodData.part_1 || null,
            part_2: wodData.part_2 || null,
            part_3: wodData.part_3 || null,
            part_4: wodData.part_4 || null,
            part_5: wodData.part_5 || null,
            part_6: wodData.part_6 || null,
            part_7: wodData.part_7 || null,
            part_8: wodData.part_8 || null,
            part_9: wodData.part_9 || null,
            part_10: wodData.part_10 || null
          } as Wod;
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
