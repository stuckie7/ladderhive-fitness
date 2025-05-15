import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFull } from "@/types/exercise";
import { WorkoutExercise } from "@/types/workout";

export type FetchWorkoutExercisesReturn = {
  exercises: WorkoutExercise[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Hook to fetch exercises associated with a workout
 */
export const useFetchWorkoutExercises = (workoutId?: string): FetchWorkoutExercisesReturn => {
  const [exercises, setExercises] = useState<WorkoutExercise[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the workout type (prepared or user-created)
  const determineWorkoutType = useCallback(async (id: string): Promise<'prepared' | 'user-created' | 'unknown'> => {
    try {
      // Check if it's a prepared workout
      const { count: preparedCount } = await supabase
        .from('prepared_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('id', id);
        
      if (preparedCount && preparedCount > 0) {
        return 'prepared';
      }
      
      // Check if it's a user-created workout
      const { count: userCount } = await supabase
        .from('user_created_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('id', id);
        
      if (userCount && userCount > 0) {
        return 'user-created';
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Error determining workout type:', error);
      return 'unknown';
    }
  }, []);

  // Function to transform raw data into WorkoutExercise objects
  const mapExerciseData = useCallback((rawExercises: any[]): WorkoutExercise[] => {
    return rawExercises.map(item => {
      let exerciseData: Exercise | ExerciseFull;
      
      // Check if exercise data is available
      if (item.exercise && !item.exercise.error) {
        exerciseData = item.exercise as ExerciseFull;
      } else {
        // Create a placeholder if no exercise data
        exerciseData = {
          id: item.exercise_id.toString(),
          name: 'Unknown Exercise',
        };
      }
      
      // Create a WorkoutExercise object
      return {
        id: item.id,
        workout_id: item.workout_id,
        exercise_id: item.exercise_id.toString(),
        sets: item.sets || 0,
        reps: item.reps || '',
        rest_seconds: item.rest_seconds || 0,
        order_index: item.order_index || 0,
        notes: item.notes || '',
        exercise: exerciseData
      };
    });
  }, []);

  // Fetch exercises for a user-created workout
  const fetchUserCreatedWorkoutExercises = useCallback(async (id: string): Promise<WorkoutExercise[]> => {
    const { data, error } = await supabase
      .from('user_created_workout_exercises')
      .select(`
        *,
        exercise:exercise_id(*)
      `)
      .eq('workout_id', id)
      .order('order_index');
    
    if (error) {
      throw new Error(`Error fetching user workout exercises: ${error.message}`);
    }
    
    return mapExerciseData(data || []);
  }, [mapExerciseData]);

  // Fetch exercises for a prepared workout
  const fetchPreparedWorkoutExercises = useCallback(async (id: string): Promise<WorkoutExercise[]> => {
    const { data, error } = await supabase
      .from('prepared_workout_exercises')
      .select(`
        *,
        exercise:exercise_id(*)
      `)
      .eq('workout_id', id)
      .order('order_index');
    
    if (error) {
      throw new Error(`Error fetching prepared workout exercises: ${error.message}`);
    }
    
    return mapExerciseData(data || []);
  }, [mapExerciseData]);

  // Fetch function that will be exposed for refetching
  const fetchExercises = useCallback(async () => {
    if (!workoutId) {
      setExercises(null);
      setError('No workout ID provided');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine if the workout is prepared or user-created
      const workoutType = await determineWorkoutType(workoutId);
      
      if (workoutType === 'unknown') {
        setError('Workout not found');
        setExercises(null);
        return;
      }
      
      // Fetch exercises based on workout type
      let workoutExercises: WorkoutExercise[];
      
      if (workoutType === 'prepared') {
        workoutExercises = await fetchPreparedWorkoutExercises(workoutId);
      } else {
        workoutExercises = await fetchUserCreatedWorkoutExercises(workoutId);
      }
      
      // Process exercises - normalize any inconsistencies
      const processedExercises = workoutExercises.map(exercise => ({
        ...exercise,
        // Ensure rest_seconds is used (not rest_time)
        rest_seconds: exercise.rest_seconds || 0,
        // Ensure other required fields
        sets: exercise.sets || 0,
        reps: exercise.reps || '',
        notes: exercise.notes || ''
      }));
      
      setExercises(processedExercises);
    } catch (error) {
      console.error('Error fetching workout exercises:', error);
      setError('Failed to load workout exercises');
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, determineWorkoutType, fetchPreparedWorkoutExercises, fetchUserCreatedWorkoutExercises]);

  // Initial fetch when workoutId changes
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exercises,
    isLoading,
    error,
    refetch: fetchExercises
  };
};
