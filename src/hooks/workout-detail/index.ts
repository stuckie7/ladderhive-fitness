
// Re-export everything from use-fetch-workout
export * from './use-fetch-workout';

// Re-export everything from use-workout-actions
export * from './use-workout-actions';

// Import and export the workout exercises hook with correct variable names
import { useManageWorkoutExercises } from '../workout-exercises/use-manage-workout-exercises';
import { Exercise } from '@/types/exercise'; 
import { useWorkoutFetch } from './use-fetch-workout';
import { useWorkoutActions } from './use-workout-actions';

// Export the useWorkoutDetail composite hook
export const useWorkoutDetail = (workoutId: string) => {
  // Validate UUID format to prevent invalid API calls
  const validWorkoutId = (() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(workoutId) ? workoutId : '';
  })();
  
  const { 
    workout, 
    isLoading: workoutLoading, 
    error: fetchError,
    fetchWorkout 
  } = useWorkoutFetch(validWorkoutId);
  
  const {
    isSaved,
    error: actionsError,
    handleSaveWorkout,
    handleCompleteWorkout
  } = useWorkoutActions(validWorkoutId);
  
  const {
    exercises: workoutExercises,
    isLoading: exercisesLoading,
    addExercise,
    removeExercise,
  } = useManageWorkoutExercises(validWorkoutId);

  // Combine error states
  const error = fetchError || actionsError;

  // Handle adding an exercise with proper typing
  const handleAddExercise = async (exercise: Exercise) => {
    return await addExercise(exercise);
  };

  // Combine all hooks into a single API
  return {
    workout,
    isLoading: workoutLoading,
    isSaved,
    workoutExercises,
    exercisesLoading,
    error,
    handleAddExercise,
    handleSaveWorkout,
    handleCompleteWorkout,
    removeExerciseFromWorkout: removeExercise,
    fetchWorkout
  };
};

// Export the workout exercises hook for use in workout detail pages
// Use the correct method names from the useManageWorkoutExercises hook
export const useWorkoutExercises = (workoutId: string) => {
  // Validate UUID format to prevent invalid API calls
  const validWorkoutId = (() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(workoutId) ? workoutId : '';
  })();
  
  const {
    exercises,
    isLoading,
    isSaving,
    fetchExercises,
    addExercise,
    updateExercise,
    removeExercise
  } = useManageWorkoutExercises(validWorkoutId);
  
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
