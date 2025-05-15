import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useFetchWorkoutExercises } from './use-fetch-workout-exercises';
import { WorkoutExercise } from './utils';
import { Exercise } from '@/types/exercise';

export const useManageWorkoutExercises = (workoutId?: string) => {
  const { toast } = useToast();
  const { exercises, refetch, isLoading } = useFetchWorkoutExercises(workoutId);
  
  // Add an exercise to a workout
  const addExerciseToWorkout = useCallback(async (
    exercise: Exercise,
    sets: number = 3,
    reps: string = '10',
    restSeconds: number = 60,
    notes: string = ''
  ) => {
    if (!workoutId) {
      toast({
        title: 'Error',
        description: 'No workout ID provided',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      // Check if this is a prepared workout or user-created workout
      const { data: preparedWorkout } = await supabase
        .from('prepared_workouts')
        .select('id')
        .eq('id', workoutId)
        .maybeSingle();
        
      const table = preparedWorkout 
        ? 'prepared_workout_exercises'
        : 'user_created_workout_exercises';
      
      // Get the next order index
      const orderIndex = exercises && exercises.length > 0
        ? Math.max(...exercises.map(ex => ex.order_index)) + 1
        : 0;
      
      // Exercise ID might be string or number, ensure we handle both
      const exerciseId = typeof exercise.id === 'string' 
        ? parseInt(exercise.id, 10) 
        : exercise.id;
      
      // Add exercise to the correct table
      const { error } = await supabase
        .from(table)
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          sets: sets,
          reps: reps,
          rest_seconds: restSeconds,
          order_index: orderIndex,
          notes: notes
        });
      
      if (error) {
        console.error(`Failed to add exercise to ${table}:`, error);
        toast({
          title: 'Error',
          description: `Failed to add exercise: ${error.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'Exercise added to workout',
      });
      
      // Refresh the exercise list
      await refetch();
      return true;
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  }, [workoutId, exercises, refetch, toast]);
  
  // Update an exercise in the workout
  const updateWorkoutExercise = useCallback(async (exerciseData: Partial<WorkoutExercise>) => {
    if (!workoutId || !exerciseData.id) {
      toast({
        title: 'Error',
        description: 'Missing workout ID or exercise ID',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      // Check if this is a prepared workout or user-created workout
      const { data: preparedWorkout } = await supabase
        .from('prepared_workouts')
        .select('id')
        .eq('id', workoutId)
        .maybeSingle();
        
      const table = preparedWorkout 
        ? 'prepared_workout_exercises'
        : 'user_created_workout_exercises';
      
      // Prepare update data - omit exercise object and use rest_seconds instead of rest_time
      const updateData = {
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        rest_seconds: exerciseData.rest_seconds ?? exerciseData.rest_seconds,
        notes: exerciseData.notes,
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', exerciseData.id);
      
      if (error) {
        console.error(`Failed to update exercise in ${table}:`, error);
        toast({
          title: 'Error',
          description: `Failed to update exercise: ${error.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'Exercise updated',
      });
      
      // Refresh the exercise list
      await refetch();
      return true;
    } catch (error) {
      console.error('Error updating workout exercise:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  }, [workoutId, refetch, toast]);
  
  // Remove an exercise from the workout
  const removeExerciseFromWorkout = useCallback(async (exerciseId: string) => {
    if (!workoutId) {
      toast({
        title: 'Error',
        description: 'No workout ID provided',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      // Check if this is a prepared workout or user-created workout
      const { data: preparedWorkout } = await supabase
        .from('prepared_workouts')
        .select('id')
        .eq('id', workoutId)
        .maybeSingle();
        
      const table = preparedWorkout 
        ? 'prepared_workout_exercises'
        : 'user_created_workout_exercises';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', exerciseId);
      
      if (error) {
        console.error(`Failed to remove exercise from ${table}:`, error);
        toast({
          title: 'Error',
          description: `Failed to remove exercise: ${error.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'Exercise removed from workout',
      });
      
      // Refresh the exercise list
      await refetch();
      return true;
    } catch (error) {
      console.error('Error removing exercise from workout:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  }, [workoutId, refetch, toast]);
  
  // Reorder exercises in the workout
  const reorderWorkoutExercises = useCallback(async (orderedExercises: { id: string, order_index: number }[]) => {
    if (!workoutId || !orderedExercises.length) {
      return false;
    }
    
    try {
      // Check if this is a prepared workout or user-created workout
      const { data: preparedWorkout } = await supabase
        .from('prepared_workouts')
        .select('id')
        .eq('id', workoutId)
        .maybeSingle();
        
      const table = preparedWorkout 
        ? 'prepared_workout_exercises'
        : 'user_created_workout_exercises';
      
      // Process each exercise update individually
      for (const item of orderedExercises) {
        const { error } = await supabase
          .from(table)
          .update({ order_index: item.order_index })
          .eq('id', item.id);
        
        if (error) {
          console.error(`Failed to reorder exercise ${item.id}:`, error);
          throw error;
        }
      }
      
      // Refresh the exercise list
      await refetch();
      return true;
    } catch (error) {
      console.error('Error reordering workout exercises:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  }, [workoutId, refetch, toast]);
  
  return {
    exercises,
    isLoading,
    addExerciseToWorkout,
    updateWorkoutExercise,
    removeExerciseFromWorkout,
    reorderWorkoutExercises,
    refetch
  };
};
