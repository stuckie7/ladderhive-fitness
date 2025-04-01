
import { useState, useEffect } from "react";
import { useFetchWorkout } from "./use-fetch-workout";
import { useWorkoutActions } from "./use-workout-actions";
import { useWorkoutExercises } from "@/hooks/use-workout-exercises";
import { Exercise } from "@/types/exercise";

export const useWorkoutDetail = (workoutId?: string) => {
  const {
    workout,
    isLoading,
    isSaved,
    setIsSaved,
    fetchWorkout
  } = useFetchWorkout(workoutId);

  const {
    isLoading: workoutActionLoading,
    handleSaveWorkout,
    handleCompleteWorkout
  } = useWorkoutActions(workoutId, setIsSaved);

  const { 
    exercises: workoutExercises, 
    isLoading: exercisesLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout
  } = useWorkoutExercises(workoutId);

  useEffect(() => {
    // Only run fetch once on mount and when workoutId changes
    const loadWorkout = async () => {
      const workoutData = await fetchWorkout();
      // Only fetch exercises if we have a valid workout
      if (workoutData && workoutId) {
        await fetchWorkoutExercises(workoutId);
      }
    };
    
    loadWorkout();
  }, [workoutId, fetchWorkout, fetchWorkoutExercises]);

  const handleAddExercise = async (exercise: Exercise) => {
    if (!workoutId) return;
    
    await addExerciseToWorkout(workoutId, exercise);
  };

  return {
    workout,
    isLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    workoutActionLoading,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout
  };
};

export * from "./use-fetch-workout";
export * from "./use-workout-actions";
