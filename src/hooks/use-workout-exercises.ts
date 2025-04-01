
import { useManageWorkoutExercises } from "./workout-exercises/use-manage-workout-exercises";
import { useCallback, useState, useEffect } from "react";

export const useWorkoutExercises = (workoutId?: string) => {
  const [initialLoading, setInitialLoading] = useState(true);
  
  const {
    exercises,
    isLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  } = useManageWorkoutExercises(workoutId);

  const fetchExercises = useCallback(() => {
    if (workoutId) {
      return fetchWorkoutExercises(workoutId);
    }
    return Promise.resolve([]);
  }, [workoutId, fetchWorkoutExercises]);

  // Set initial loading to false after first data fetch
  useEffect(() => {
    if (!isLoading && initialLoading) {
      setInitialLoading(false);
    }
  }, [isLoading, initialLoading]);

  return {
    exercises,
    isLoading: isLoading || initialLoading,
    fetchWorkoutExercises: fetchExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  };
};
