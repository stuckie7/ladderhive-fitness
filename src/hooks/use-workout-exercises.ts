
import { useManageWorkoutExercises } from "./workout-exercises/use-manage-workout-exercises";
import { useCallback } from "react";

export const useWorkoutExercises = (workoutId?: string) => {
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

  return {
    exercises,
    isLoading,
    fetchWorkoutExercises: fetchExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  };
};
