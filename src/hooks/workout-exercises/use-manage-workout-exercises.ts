
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { WorkoutExercise, ensureStringReps } from './utils';

export const useManageWorkoutExercises = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addExerciseToWorkout = async (
    workoutId: string,
    exercise: Exercise,
    sets: number = 3,
    reps: string = '10',
    restSeconds: number = 60,
    orderIndex: number = 0
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!workoutId) throw new Error('Workout ID is required');
      if (!exercise || !exercise.id) throw new Error('Invalid exercise data');
      
      // Ensure exercise.id is a string when it might be a number
      const exerciseId = exercise.id.toString();
      
      const { data, error: insertError } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: sets,
          reps: reps,
          rest_time: restSeconds,
          order_index: orderIndex
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: 'Exercise added',
        description: `${exercise.name} has been added to your workout.`
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add exercise to workout';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkoutExercise = async (
    exercise: WorkoutExercise
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!exercise || !exercise.id) throw new Error('Invalid exercise data');
      
      const { error: updateError } = await supabase
        .from('workout_exercises')
        .update({
          sets: exercise.sets,
          reps: ensureStringReps(exercise.reps),
          rest_time: exercise.rest_time,
          weight: exercise.weight
        })
        .eq('id', exercise.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: 'Exercise updated',
        description: `Workout exercise has been updated.`
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update exercise';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeExerciseFromWorkout = async (exerciseId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: 'Exercise removed',
        description: `Exercise has been removed from the workout.`
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove exercise';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    addExerciseToWorkout,
    updateWorkoutExercise,
    removeExerciseFromWorkout
  };
};
