
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { useToast } from '@/components/ui/use-toast';
import { WorkoutExercise } from './utils';

export interface ManageWorkoutExercisesReturn {
  addExerciseToWorkout: (workoutId: string, exercise: Exercise, sets?: number, reps?: string | number) => Promise<boolean>;
  updateExerciseDetails: (exerciseData: Partial<WorkoutExercise>) => Promise<boolean>;
  removeExercise: (exerciseId: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export const useManageWorkoutExercises = (workoutId?: string): ManageWorkoutExercisesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Add a new exercise to a workout
  const addExerciseToWorkout = async (
    workoutId: string,
    exercise: Exercise,
    sets: number = 3,
    reps: string | number = "10"
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the current count of exercises for ordering
      const { data: existingExercises, error: countError } = await supabase
        .from('user_created_workout_exercises')
        .select('id')
        .eq('workout_id', workoutId);

      if (countError) {
        throw new Error(countError.message);
      }

      const orderIndex = existingExercises?.length || 0;
      
      // Ensure exercise ID is a number
      const exerciseId = typeof exercise.id === 'string' ? 
        parseInt(exercise.id, 10) : 
        exercise.id;
        
      // Now insert the new exercise
      const { error: insertError } = await supabase
        .from('user_created_workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets,
          reps: reps.toString(),
          rest_seconds: 60,
          order_index: orderIndex
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      toast({
        title: "Exercise Added",
        description: `${exercise.name} has been added to your workout.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add exercise';
      console.error('Error adding exercise to workout:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update exercise details (sets, reps, rest time, etc.)
  const updateExerciseDetails = async (exerciseData: Partial<WorkoutExercise>): Promise<boolean> => {
    if (!exerciseData.id) {
      setError(new Error('Exercise ID is required for update'));
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { id, sets, reps, rest_time, rest_seconds, weight, notes, order_index } = exerciseData;
      
      // Prepare update data, converting exercise_id to number if needed
      const updateData: any = {
        sets,
        reps: reps?.toString(),
        rest_seconds: rest_time || rest_seconds,
        notes: notes || weight, // Store weight in notes if dedicated field isn't available
        order_index
      };

      const { error: updateError } = await supabase
        .from('user_created_workout_exercises')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast({
        title: "Exercise Updated",
        description: "The exercise details have been updated.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update exercise';
      console.error('Error updating exercise details:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an exercise from a workout
  const removeExercise = async (exerciseId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('user_created_workout_exercises')
        .delete()
        .eq('id', exerciseId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      toast({
        title: "Exercise Removed",
        description: "The exercise has been removed from your workout.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove exercise';
      console.error('Error removing exercise:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addExerciseToWorkout,
    updateExerciseDetails,
    removeExercise,
    isLoading,
    error
  };
};
