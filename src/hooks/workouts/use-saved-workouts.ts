
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Workout, UserWorkout } from '@/types/workout';

export const useSavedWorkouts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState<UserWorkout[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedWorkouts = useCallback(async () => {
    if (!user) return [];
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_workouts')
        .select(`
          id,
          user_id,
          workout_id,
          status,
          completed_at,
          planned_for,
          workout:workouts(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'saved');
      
      if (error) throw error;
      
      // Process data to normalize workout structure
      const processedWorkouts = (data || []).map(item => {
        // Check if workouts data exists
        if (!item.workout) return null;
        
        const workoutData = item.workout;
        
        // Create the workout object with properties that definitely exist
        const workout: Workout = {
          id: item.workout_id,
          title: workoutData.title,
          description: workoutData.description || '',
          duration: workoutData.duration || 0,
          exercises: workoutData.exercises || 0,
          difficulty: workoutData.difficulty || 'Beginner',
          isSaved: true
        };
        
        // Safely add category if it exists using type assertion
        // This works because we're first checking if the property exists on the object
        if ('category' in workoutData && typeof workoutData.category === 'string') {
          (workout as Workout & { category: string }).category = workoutData.category;
        }
        
        return {
          id: item.id,
          user_id: item.user_id,
          workout_id: item.workout_id,
          status: item.status,
          completed_at: item.completed_at,
          planned_for: item.planned_for,
          workout
        } as UserWorkout;
      }).filter(Boolean) as UserWorkout[];
      
      setSavedWorkouts(processedWorkouts);
      return processedWorkouts;
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
  }, [user, toast]);

  const removeFromSaved = useCallback(async (userWorkoutId: string) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('user_workouts')
        .delete()
        .eq('id', userWorkoutId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update the local state
      setSavedWorkouts(prev => prev.filter(item => item.id !== userWorkoutId));
      
      toast({
        title: "Success",
        description: "Workout removed from saved workouts",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing workout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove workout",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchSavedWorkouts();
    }
  }, [user, fetchSavedWorkouts]);

  return {
    isLoading,
    savedWorkouts,
    fetchSavedWorkouts,
    removeFromSaved
  };
};
