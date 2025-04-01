
import { useState, useEffect, useRef } from "react";
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

  const initialFetchDone = useRef(false);

  useEffect(() => {
    // Only run fetch once on mount and when workoutId changes
    if (!initialFetchDone.current && workoutId) {
      const loadWorkout = async () => {
        await fetchWorkout();
      };
      
      loadWorkout();
      initialFetchDone.current = true;
    }
  }, [workoutId, fetchWorkout]);

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
