
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchWorkoutById } from './workout-detail/use-fetch-workout';
import { useWorkoutActions } from './workout-detail/use-workout-actions';
import { useFetchWorkoutExercises } from './workout-exercises/use-fetch-workout-exercises';
import { Exercise } from '@/types/exercise';

export const useWorkoutDetail = (workoutId?: string) => {
  const [workout, setWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { exercises: workoutExercises, isLoading: exercisesLoading, refetch: fetchExercises } = useFetchWorkoutExercises(workoutId);
  const { isSaved, handleSaveWorkout, handleCompleteWorkout } = useWorkoutActions(workoutId);
  const { toast } = useToast();
  
  // Fetch workout details on initial load
  useEffect(() => {
    const loadWorkout = async () => {
      if (!workoutId) {
        setError('No workout ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const workoutData = await fetchWorkoutById(workoutId);
        if (workoutData) {
          setWorkout(workoutData);
        } else {
          setError('Workout not found');
        }
      } catch (err) {
        console.error('Error loading workout details:', err);
        setError('Failed to load workout details');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkout();
  }, [workoutId]);

  // Function to add an exercise to the workout
  const handleAddExercise = useCallback(async (exercise: Exercise): Promise<void> => {
    toast({
      title: "Feature in development",
      description: "Adding exercises to existing workouts will be available soon.",
      variant: "default"
    });
    return Promise.resolve();
  }, [toast]);

  // Function to remove an exercise from the workout
  const removeExerciseFromWorkout = useCallback(async (exerciseId: string): Promise<void> => {
    toast({
      title: "Feature in development",
      description: "Removing exercises from workouts will be available soon.",
      variant: "default"
    });
    return Promise.resolve();
  }, [toast]);

  return {
    workout,
    isLoading: isLoading || exercisesLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    error,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout,
    removeExerciseFromWorkout,
    // Explicitly define exercises property as an alias for workoutExercises
    exercises: workoutExercises
  };
};
