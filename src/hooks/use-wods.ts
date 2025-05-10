
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Wod, WodFilters } from '@/types/wod';

export const useWods = () => {
  const [wods, setWods] = useState<Wod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWod, setSelectedWod] = useState<Wod | null>(null);
  const [filters, setFilters] = useState<WodFilters>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchWods = useCallback(async (filterOptions?: WodFilters) => {
    setIsLoading(true);
    try {
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
      
      // Map results and mark favorites
      const mappedWods = data?.map(wod => ({
        ...wod,
        components: wod.components || [],
        is_favorite: userFavorites.includes(wod.id)
      })) || [];
      
      setWods(mappedWods);
      
    } catch (error: any) {
      console.error("Error fetching wods:", error);
      toast({
        title: "Error",
        description: "Failed to load workouts of the day",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const fetchWodById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wods')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
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
      
      setSelectedWod({
        ...data,
        is_favorite: isFavorite
      });
      
      return data;
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

  const toggleFavorite = useCallback(async (wodId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if it's already a favorite
      const { data: existingFav, error: checkError } = await supabase
        .from('user_favorite_wods')
        .select('*')
        .eq('user_id', user.id)
        .eq('wod_id', wodId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found" error
        throw checkError;
      }
      
      // If it's a favorite, remove it; otherwise, add it
      if (existingFav) {
        const { error: removeError } = await supabase
          .from('user_favorite_wods')
          .delete()
          .eq('user_id', user.id)
          .eq('wod_id', wodId);
        
        if (removeError) throw removeError;
        
        toast({
          title: "Removed from Favorites",
          description: "Workout has been removed from your favorites",
        });
        
        // Update local state
        setWods(prev => prev.map(wod => 
          wod.id === wodId ? { ...wod, is_favorite: false } : wod
        ));
        
        if (selectedWod?.id === wodId) {
          setSelectedWod(prev => prev ? { ...prev, is_favorite: false } : null);
        }
      } else {
        const { error: addError } = await supabase
          .from('user_favorite_wods')
          .insert({ user_id: user.id, wod_id: wodId });
        
        if (addError) throw addError;
        
        toast({
          title: "Added to Favorites",
          description: "Workout has been added to your favorites",
        });
        
        // Update local state
        setWods(prev => prev.map(wod => 
          wod.id === wodId ? { ...wod, is_favorite: true } : wod
        ));
        
        if (selectedWod?.id === wodId) {
          setSelectedWod(prev => prev ? { ...prev, is_favorite: true } : null);
        }
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  }, [user, toast, selectedWod]);

  const getFavoriteWods = useCallback(async () => {
    if (!user) {
      setWods([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorite_wods')
        .select('wod_id, wods(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const favoriteWods = data
        .filter(item => item.wods)
        .map(item => ({
          ...item.wods,
          is_favorite: true
        }));
      
      setWods(favoriteWods);
    } catch (error: any) {
      console.error("Error fetching favorite wods:", error);
      toast({
        title: "Error",
        description: "Failed to load favorite workouts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Fetch WODs on initial load
  useEffect(() => {
    fetchWods(filters);
  }, [fetchWods, filters]);

  return {
    wods,
    isLoading,
    selectedWod,
    filters,
    setFilters,
    fetchWods,
    fetchWodById,
    toggleFavorite,
    getFavoriteWods
  };
};
