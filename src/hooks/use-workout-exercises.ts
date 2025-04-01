
import { useManageWorkoutExercises } from "./workout-exercises/use-manage-workout-exercises";

export const useWorkoutExercises = (workoutId?: string) => {
  const {
    exercises,
    isLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  } = useManageWorkoutExercises(workoutId);

  return {
    exercises,
    isLoading,
    fetchWorkoutExercises,
    addExerciseToWorkout,
    removeExerciseFromWorkout
  };
};
