
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { WorkoutExercise } from './use-fetch-workout-exercises';
import { useToast } from '@/hooks/use-toast';

interface ManageWorkoutExercisesReturn {
  addExerciseToWorkout: (workoutId: string, exercise: Exercise, details?: ExerciseDetails) => Promise<boolean>;
  updateExerciseDetails: (exerciseId: string, details: ExerciseDetails) => Promise<boolean>;
  removeExerciseFromWorkout: (exerciseId: string) => Promise<boolean>;
  reorderWorkoutExercises: (exercises: WorkoutExercise[]) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export interface ExerciseDetails {
  sets?: number;
  reps?: string | number;
  weight?: string;
  rest_seconds?: number;
  notes?: string;
}

export const useManageWorkoutExercises = (workoutId?: string): ManageWorkoutExercisesReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const addExerciseToWorkout = useCallback(async (
    workoutId: string, 
    exercise: Exercise, 
    details: ExerciseDetails = { sets: 3, reps: '10', rest_seconds: 60 }
  ): Promise<boolean> => {
    if (!workoutId || !exercise) {
      setError(new Error('WorkoutId and exercise are required'));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the current exercises to determine the next order_index
      const { data: currentExercises } = await supabase
        .from('user_created_workout_exercises')
        .select('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = currentExercises && currentExercises.length > 0 
        ? currentExercises[0].order_index + 1 
        : 0;

      // Convert exercise_id to number if possible
      let exerciseId = exercise.id;
      if (typeof exerciseId === 'string' && !isNaN(Number(exerciseId))) {
        exerciseId = Number(exerciseId);
      }

      const { error: insertError } = await supabase
        .from('user_created_workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: details.sets || 3,
          reps: details.reps?.toString() || '10',
          rest_seconds: details.rest_seconds || 60,
          order_index: nextOrderIndex,
          weight: details.weight || '',
          notes: details.notes || ''
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Success',
        description: `${exercise.name} added to workout`,
      });

      return true;
    } catch (err: any) {
      console.error('Error adding exercise to workout:', err);
      setError(err instanceof Error ? err : new Error('Failed to add exercise to workout'));
      
      toast({
        title: 'Error',
        description: 'Failed to add exercise to workout',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateExerciseDetails = useCallback(async (
    exerciseId: string, 
    details: ExerciseDetails
  ): Promise<boolean> => {
    if (!exerciseId) {
      setError(new Error('Exercise ID is required'));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert to proper type for reps and rest time
      const updateData: Record<string, any> = {};
      
      if (details.sets !== undefined) updateData.sets = details.sets;
      if (details.reps !== undefined) updateData.reps = details.reps.toString();
      if (details.rest_seconds !== undefined) updateData.rest_seconds = details.rest_seconds;
      if (details.weight !== undefined) updateData.weight = details.weight;
      if (details.notes !== undefined) updateData.notes = details.notes;

      const { error: updateError } = await supabase
        .from('user_created_workout_exercises')
        .update(updateData)
        .eq('id', exerciseId);

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      console.error('Error updating exercise details:', err);
      setError(err instanceof Error ? err : new Error('Failed to update exercise details'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeExerciseFromWorkout = useCallback(async (exerciseId: string): Promise<boolean> => {
    if (!exerciseId) {
      setError(new Error('Exercise ID is required'));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First get the exercise data to show in success message
      const { data: exerciseData } = await supabase
        .from('user_created_workout_exercises')
        .select('exercise_id')
        .eq('id', exerciseId)
        .single();
        
      // Delete the exercise
      const { error: deleteError } = await supabase
        .from('user_created_workout_exercises')
        .delete()
        .eq('id', exerciseId);

      if (deleteError) throw deleteError;

      toast({
        title: 'Success',
        description: `Exercise removed from workout`,
      });

      return true;
    } catch (err: any) {
      console.error('Error removing exercise from workout:', err);
      setError(err instanceof Error ? err : new Error('Failed to remove exercise from workout'));
      
      toast({
        title: 'Error',
        description: 'Failed to remove exercise from workout',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const reorderWorkoutExercises = useCallback(async (exercises: WorkoutExercise[]): Promise<boolean> => {
    if (!exercises.length) {
      return true; // Nothing to do
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update each exercise with its new order index
      const updates = exercises.map((exercise, index) => ({
        id: exercise.id,
        order_index: index
      }));

      const { error: updateError } = await supabase
        .from('user_created_workout_exercises')
        .upsert(updates);

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      console.error('Error reordering exercises:', err);
      setError(err instanceof Error ? err : new Error('Failed to reorder exercises'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    addExerciseToWorkout,
    updateExerciseDetails,
    removeExerciseFromWorkout,
    reorderWorkoutExercises,
    isLoading,
    error
  };
};
