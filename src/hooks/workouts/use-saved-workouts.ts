
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserWorkout, Workout } from '@/types/workout';

export const useSavedWorkouts = () => {
  const [savedWorkouts, setSavedWorkouts] = useState<UserWorkout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSavedWorkouts = useCallback(async () => {
    if (!user) {
      setSavedWorkouts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch user-created workouts
      const { data: userCreatedWorkouts, error: userCreatedError } = await supabase
        .from('user_created_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (userCreatedError) throw userCreatedError;

      // Format user-created workouts to match the UserWorkout interface
      const formattedWorkouts: UserWorkout[] = userCreatedWorkouts.map(workout => ({
        id: `user-${workout.id}`, // Prefix to identify source
        user_id: workout.user_id,
        workout_id: workout.id,
        status: 'saved',
        completed_at: null,
        planned_for: null,
        date: new Date(workout.created_at).toLocaleDateString(),
        workout: {
          id: workout.id,
          title: workout.title,
          description: workout.description || '',
          duration: workout.duration_minutes,
          difficulty: workout.difficulty,
          exercises: 0, // Will be populated later if needed
          category: workout.category,
          isSaved: true
        }
      }));

      setSavedWorkouts(formattedWorkouts);
    } catch (error) {
      console.error('Error fetching saved workouts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your saved workouts.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const removeFromSaved = useCallback(async (userWorkout: UserWorkout) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to manage workouts.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Extract the actual workout ID (remove prefix if necessary)
      const workoutId = userWorkout.workout_id || userWorkout.workout.id;
      
      // Delete from user_created_workouts
      const { error } = await supabase
        .from('user_created_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Workout Removed',
        description: 'The workout has been removed from your saved workouts.'
      });

      // Update local state
      setSavedWorkouts(prev => prev.filter(w => w.id !== userWorkout.id));
    } catch (error) {
      console.error('Error removing workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove the workout.',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSavedWorkouts();
  }, [fetchSavedWorkouts]);

  return {
    savedWorkouts,
    isLoading,
    removeFromSaved,
    fetchSavedWorkouts
  };
};
