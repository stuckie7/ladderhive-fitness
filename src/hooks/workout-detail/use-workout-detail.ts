
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useFetchWorkoutExercises } from '../workout-exercises';
import { useWorkoutActions } from './use-workout-actions';
import { fetchWorkoutById } from './use-fetch-workout';

export type WorkoutDetailHookReturn = ReturnType<typeof useWorkoutDetail>;

export const useWorkoutDetail = (id?: string) => {
  const [workout, setWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompletingWorkout, setIsCompletingWorkout] = useState<boolean>(false);

  const { toast } = useToast();
  
  // Use the workout exercises hook
  const { exercises, isLoading: exercisesLoading, refetch: refetchExercises } = useFetchWorkoutExercises(id);
  
  // Use workout actions
  const { handleSaveWorkout, handleCompleteWorkout } = useWorkoutActions(id);

  // Fetch workout details
  useEffect(() => {
    const loadWorkout = async () => {
      if (!id) {
        setError('No workout ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch workout data from database
        const workoutData = await fetchWorkoutById(id);
        
        if (!workoutData) {
          setError('Workout not found');
          setIsLoading(false);
          return;
        }
        
        // Attach exercises to workout object
        setWorkout({
          ...workoutData,
          exercises: exercises || []
        });
        
      } catch (err) {
        console.error('Error loading workout:', err);
        setError('Failed to load workout details');
        toast({
          title: 'Error',
          description: 'Failed to load workout details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [id, exercises, toast]);

  // Handle workout completion
  const completeWorkout = async () => {
    if (!workout) return;
    
    setIsCompletingWorkout(true);
    
    try {
      await handleCompleteWorkout();
      toast({
        title: 'Workout completed',
        description: 'Great job! Your workout has been marked as completed.',
      });
    } catch (err) {
      console.error('Error completing workout:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark workout as completed',
        variant: 'destructive',
      });
    } finally {
      setIsCompletingWorkout(false);
    }
  };

  // Refresh workout data
  const refreshWorkout = async () => {
    setIsLoading(true);
    
    try {
      if (id) {
        const freshWorkout = await fetchWorkoutById(id);
        await refetchExercises();
        
        if (freshWorkout) {
          setWorkout({
            ...freshWorkout,
            exercises: exercises || []
          });
        }
      }
    } catch (err) {
      console.error('Error refreshing workout:', err);
      toast({
        title: 'Error',
        description: 'Failed to refresh workout data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workout,
    isLoading: isLoading || exercisesLoading,
    error,
    completeWorkout,
    isCompletingWorkout,
    refreshWorkout
  };
};
