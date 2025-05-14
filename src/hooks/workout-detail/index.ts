
// Re-export everything from use-fetch-workout
export * from './use-fetch-workout';

// Re-export everything from use-workout-actions
export * from './use-workout-actions';

// Import and export the workout exercises hook with correct variable names
import { useManageWorkoutExercises } from '../workout-exercises/use-manage-workout-exercises';

// Export the workout exercises hook for use in workout detail pages
// Use the correct method names from the useManageWorkoutExercises hook
export const useWorkoutExercises = (workoutId: string) => {
  const {
    exercises,
    isLoading,
    isSaving,
    fetchExercises,
    addExercise,
    updateExercise,
    removeExercise
  } = useManageWorkoutExercises(workoutId);
  
  return {
    exercises,
    isLoading,
    isAdding: isSaving,
    fetchWorkoutExercises: fetchExercises,
    addExerciseToWorkout: addExercise,
    removeExerciseFromWorkout: removeExercise,
    updateExerciseDetails: updateExercise
  };
};
