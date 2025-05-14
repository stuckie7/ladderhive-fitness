
// Re-export the updated hooks with the correct names
import { useManageWorkoutExercises } from './workout-exercises/use-manage-workout-exercises';

// Correct naming to match what's used in the codebase
export const useWorkoutExercises = (workoutId: string) => {
  const {
    exercises,
    isLoading,
    isSaving,
    fetchExercises,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises
  } = useManageWorkoutExercises(workoutId);

  return {
    exercises,
    isLoading,
    isSaving,
    fetchExercises,
    addExercise,
    updateExercise,
    removeExercise,
    reorderExercises
  };
};
