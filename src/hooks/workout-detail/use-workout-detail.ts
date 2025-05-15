
import { useWorkoutActions } from './use-workout-actions';
import { useWorkoutFetch } from './use-fetch-workout';
import { useWorkoutExercises } from './workout-exercises/use-fetch-workout-exercises';
import { Exercise } from '@/types/exercise';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useWorkoutDetail = (workoutId: string | undefined) => {
  // Handle undefined workoutId gracefully
  const safeWorkoutId = workoutId || '';
  const { workout, isLoading: workoutLoading, error } = useWorkoutFetch(safeWorkoutId);
  const { workoutExercises, isLoading: exercisesLoading } = useWorkoutExercises(safeWorkoutId);
  const { isSaved, handleSaveWorkout, handleCompleteWorkout } = useWorkoutActions(safeWorkoutId);
  const { toast } = useToast();

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
    isLoading: workoutLoading || exercisesLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    error,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout,
    removeExerciseFromWorkout
  };
};
