
// Re-export everything from use-fetch-workout
export * from './use-fetch-workout';

// Re-export everything from use-workout-actions
export * from './use-workout-actions';

// Import and export the workout exercises hook
import { useManageWorkoutExercises } from '../workout-exercises/use-manage-workout-exercises';

// Export the workout exercises hook for use in workout detail pages
export const useWorkoutExercises = useManageWorkoutExercises;
