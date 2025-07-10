
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/lib/supabase';
import { Exercise, ExerciseFull } from "@/types/exercise";
import { WorkoutExercise } from "@/types/workout";
import { mapExerciseFullToExercise } from "./utils";

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
  const mapExerciseData = useCallback((rawExerciseData: any[], exerciseDetails: any[]): WorkoutExercise[] => {
    return rawExerciseData.map(item => {
      // Find the matching exercise detail by ID
      const exerciseDetail = exerciseDetails.find(detail => detail.id === item.exercise_id);
      
      // Create a base Exercise object, even if details are missing
      const exerciseData: Exercise = {
        id: item.exercise_id.toString(),
        name: exerciseDetail?.name || 'Unknown Exercise',
        video_url: exerciseDetail?.short_youtube_demo,
        image_url: exerciseDetail?.youtube_thumbnail_url,
      };
      
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
    // Get the exercise relationships
    const { data: exerciseRelations, error: relationsError } = await supabase
      .from('user_created_workout_exercises')
      .select('*')
      .eq('workout_id', id)
      .order('order_index');
    
    if (relationsError) {
      throw new Error(`Error fetching user workout exercises: ${relationsError.message}`);
    }
    
    if (!exerciseRelations || exerciseRelations.length === 0) {
      return [];
    }
    
    // Get the exercise details separately
    const exerciseIds = exerciseRelations.map(rel => rel.exercise_id);
    const { data: exerciseDetails, error: detailsError } = await supabase
      .from('exercises_full')
      .select('*')
      .in('id', exerciseIds);
      
    if (detailsError) {
      throw new Error(`Error fetching exercise details: ${detailsError.message}`);
    }
    
    return mapExerciseData(exerciseRelations, exerciseDetails || []);
  }, [mapExerciseData]);

  // Fetch exercises for a prepared workout
  const fetchPreparedWorkoutExercises = useCallback(async (id: string): Promise<WorkoutExercise[]> => {
    // Get the exercise relationships
    const { data: exerciseRelations, error: relationsError } = await supabase
      .from('prepared_workout_exercises')
      .select('*')
      .eq('workout_id', id)
      .order('order_index');
    
    if (relationsError) {
      throw new Error(`Error fetching prepared workout exercises: ${relationsError.message}`);
    }
    
    if (!exerciseRelations || exerciseRelations.length === 0) {
      return [];
    }
    
    // Get the exercise details separately
    const exerciseIds = exerciseRelations.map(rel => rel.exercise_id);
    const { data: exerciseDetails, error: detailsError } = await supabase
      .from('exercises_full')
      .select('*')
      .in('id', exerciseIds);
      
    if (detailsError) {
      throw new Error(`Error fetching exercise details: ${detailsError.message}`);
    }
    
    return mapExerciseData(exerciseRelations, exerciseDetails || []);
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
