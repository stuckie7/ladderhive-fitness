
import { useWorkoutExercises as useManageWorkoutExercises } from "./workout-exercises/use-manage-workout-exercises";
import { useCallback, useState, useEffect } from "react";
import { WorkoutExercise } from "./workout-exercises/utils";
import { Exercise } from "@/types/exercise";

export const useWorkoutExercises = (workoutId?: string) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [localExercises, setLocalExercises] = useState<WorkoutExercise[]>([]);
  const [localIsLoading, setLocalIsLoading] = useState(true);
  
  const {
    exercises,
    isLoading,
    isSaving: isAdding,
    fetchExercises: fetchWorkoutExercises,
    addExercise: addExerciseToWorkout,
    removeExercise: removeExerciseFromWorkout,
    updateExercise: updateExerciseDetails
  } = useManageWorkoutExercises(workoutId || '');

  // Use the exercises from useManageWorkoutExercises hook
  useEffect(() => {
    if (exercises) {
      setLocalExercises(exercises);
    }
  }, [exercises]);

  // Use the loading state from useManageWorkoutExercises hook
  useEffect(() => {
    setLocalIsLoading(isLoading);
  }, [isLoading]);

  // Set initial loading to false after first data fetch
  useEffect(() => {
    if (!isLoading && initialLoading) {
      setInitialLoading(false);
    }
  }, [isLoading, initialLoading]);

  // Initial data fetch if workoutId is provided
  useEffect(() => {
    if (workoutId) {
      fetchWorkoutExercises();
    }
  }, [workoutId, fetchWorkoutExercises]);

  return {
    exercises: localExercises,
    isLoading: localIsLoading || initialLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    updateExerciseDetails,
    isAdding
  };
};
