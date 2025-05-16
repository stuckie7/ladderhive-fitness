
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useWodFavorites = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleFavorite = useCallback(async (wodId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites",
        variant: "destructive"
      });
      return false;
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
        
        return false;
      } else {
        const { error: addError } = await supabase
          .from('user_favorite_wods')
          .insert({ user_id: user.id, wod_id: wodId });
        
        if (addError) throw addError;
        
        toast({
          title: "Added to Favorites",
          description: "Workout has been added to your favorites",
        });
        
        return true;
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  return {
    toggleFavorite
  };
};
