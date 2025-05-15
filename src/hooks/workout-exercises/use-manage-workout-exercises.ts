
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { WorkoutExercise } from './utils';

type ApiResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

export const useManageWorkoutExercises = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Add an exercise to a workout
   */
  const addExerciseToWorkout = async (
    workoutId: string,
    exercise: Exercise,
    sets: number = 3,
    reps: string | number = 10,
    restSeconds: number = 60,
    orderIndex: number = 0
  ): Promise<ApiResponse> => {
    setIsProcessing(true);
    try {
      // Convert exercise ID to number if it's a string
      const exerciseId = typeof exercise.id === 'string' ? parseInt(exercise.id) : exercise.id;
      
      if (isNaN(Number(exerciseId))) {
        throw new Error(`Invalid exercise ID: ${exerciseId}`);
      }
      
      // Check if workoutId is in prepared_workouts or user_created_workouts
      const { data: preparedWorkout } = await supabase
        .from('prepared_workouts')
        .select('id')
        .eq('id', workoutId)
        .single();

      if (preparedWorkout) {
        // This is a prepared workout
        const { error } = await supabase
          .from('prepared_workout_exercises')
          .insert({
            workout_id: workoutId,
            exercise_id: Number(exerciseId),
            sets,
            reps: reps.toString(),
            rest_seconds: restSeconds,
            order_index: orderIndex
          });

        if (error) throw error;
      } else {
        // This is a user created workout 
        const { error } = await supabase
          .from('user_created_workout_exercises')
          .insert({
            workout_id: workoutId,
            exercise_id: Number(exerciseId),
            sets,
            reps: reps.toString(),
            rest_seconds: restSeconds,
            order_index: orderIndex
          });

        if (error) throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error adding exercise to workout:', error);
      return { success: false, error: error.message || 'Failed to add exercise' };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Remove an exercise from a workout
   */
  const removeExerciseFromWorkout = async (exerciseId: string): Promise<ApiResponse> => {
    setIsProcessing(true);
    try {
      // First try user created workouts
      const { error: userError } = await supabase
        .from('user_created_workout_exercises')
        .delete()
        .eq('id', exerciseId);

      if (userError) {
        // If not found in user workouts, try prepared workouts
        const { error: preparedError } = await supabase
          .from('prepared_workout_exercises')
          .delete()
          .eq('id', exerciseId);

        if (preparedError) throw preparedError;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error removing exercise from workout:', error);
      return { success: false, error: error.message || 'Failed to remove exercise' };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Update an exercise in a workout
   */
  const updateWorkoutExercise = async (exercise: WorkoutExercise): Promise<ApiResponse> => {
    setIsProcessing(true);
    try {
      // First try to update in user created workouts
      const { data: userData, error: userError } = await supabase
        .from('user_created_workout_exercises')
        .select('id')
        .eq('id', exercise.id)
        .single();

      // Convert exercise ID to number if it's a string
      let exerciseId: number;
      if (typeof exercise.exercise_id === 'string') {
        const parsedId = parseInt(exercise.exercise_id);
        if (isNaN(parsedId)) {
          throw new Error(`Invalid exercise ID: ${exercise.exercise_id}`);
        }
        exerciseId = parsedId;
      } else {
        exerciseId = exercise.exercise_id as number;
      }

      // Ensure we have rest_seconds (use rest_time as fallback)
      const restSeconds = exercise.rest_seconds || exercise.rest_time;

      if (userData) {
        // If found in user workouts, update there
        const { error } = await supabase
          .from('user_created_workout_exercises')
          .update({
            sets: exercise.sets,
            reps: exercise.reps.toString(),
            rest_seconds: restSeconds,
            order_index: exercise.order_index,
            notes: exercise.notes,
            weight: exercise.weight
          })
          .eq('id', exercise.id);

        if (error) throw error;
      } else {
        // Otherwise, try prepared workouts
        const { error } = await supabase
          .from('prepared_workout_exercises')
          .update({
            sets: exercise.sets,
            reps: exercise.reps.toString(),
            rest_seconds: restSeconds,
            order_index: exercise.order_index,
            notes: exercise.notes
          })
          .eq('id', exercise.id);

        if (error) throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating workout exercise:', error);
      return { success: false, error: error.message || 'Failed to update exercise' };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateWorkoutExercise
  };
};
