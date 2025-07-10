
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Wod } from '@/types/wod';

export const useWods = () => {
  const [selectedWod, setSelectedWod] = useState<Wod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch a specific WOD by ID
  const fetchWodById = useCallback(async (wodId: string) => {
    setIsLoading(true);
    
    try {
      // Get user ID for favorites
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Fetch the WOD
      const { data, error } = await supabase
        .from('wods')
        .select('*')
        .eq('id', wodId)
        .single();
      
      if (error) throw error;
      
      // Check if this WOD is a favorite for the current user
      let isFavorite = false;
      if (userId) {
        const { data: favData, error: favError } = await supabase
          .from('user_favorite_wods')
          .select('*')
          .eq('user_id', userId)
          .eq('wod_id', wodId);
        
        if (!favError && favData && favData.length > 0) {
          isFavorite = true;
        }
      }
      
      // Get WOD components if any
      const { data: components, error: componentsError } = await supabase
        .from('wod_components')
        .select('*')
        .eq('wod_id', wodId)
        .order('order', { ascending: true });
      
      if (componentsError) {
        console.error('Error fetching WOD components:', componentsError);
      }
      
      // Prepare the WOD data with favorites and components
      const wodWithDetails: Wod = {
        ...data,
        is_favorite: isFavorite,
        is_new: new Date(data.created_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
        components: components || []
      };
      
      setSelectedWod(wodWithDetails);
      
    } catch (error) {
      console.error('Error fetching WOD:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout details. Please try again.',
        variant: 'destructive',
      });
      setSelectedWod(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (wodId: string) => {
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to save favorites',
          variant: 'destructive',
        });
        return;
      }
      
      const userId = user.id;
      
      // Check if this WOD is already a favorite
      const { data: existingFav, error: checkError } = await supabase
        .from('user_favorite_wods')
        .select('*')
        .eq('user_id', userId)
        .eq('wod_id', wodId);
      
      if (checkError) throw checkError;
      
      // If it's already a favorite, remove it; otherwise, add it
      if (existingFav && existingFav.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_favorite_wods')
          .delete()
          .eq('user_id', userId)
          .eq('wod_id', wodId);
        
        if (deleteError) throw deleteError;
        
        // Update local state if this is the currently selected WOD
        if (selectedWod && selectedWod.id === wodId) {
          setSelectedWod({
            ...selectedWod,
            is_favorite: false
          });
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_favorite_wods')
          .insert({
            user_id: userId,
            wod_id: wodId
          });
        
        if (insertError) throw insertError;
        
        // Update local state if this is the currently selected WOD
        if (selectedWod && selectedWod.id === wodId) {
          setSelectedWod({
            ...selectedWod,
            is_favorite: true
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [selectedWod, toast]);

  return {
    selectedWod,
    isLoading,
    fetchWodById,
    toggleFavorite
  };
};
