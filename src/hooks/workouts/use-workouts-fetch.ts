
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Workout, UserWorkout } from '@/types/workout';

export const useWorkouts = (
  isLoading: boolean,
  setIsLoading: (value: boolean) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchAllWorkouts = async (): Promise<Workout[]> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching workouts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load workouts",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedWorkouts = async (): Promise<{ workout: Workout, id: string }[]> => {
    if (!user) return [];
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_workouts')
        .select('id, workout_id, workouts(*)')
        .eq('user_id', user.id)
        .eq('status', 'saved');
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        workout: item.workouts as Workout,
        id: item.id
      }));
    } catch (error: any) {
      console.error("Error fetching saved workouts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load saved workouts",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAllWorkouts,
    fetchSavedWorkouts
  };
};

export const useWorkoutsFetch = useWorkouts; // Export with both names for backwards compatibility
