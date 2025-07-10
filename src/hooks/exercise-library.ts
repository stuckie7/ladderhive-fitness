
// Re-export the hooks from the exercise-library folder
export { useExerciseLibrary } from './exercise-library/hooks/use-exercise-library';
export { type Exercise, type ExerciseFull } from '@/types/exercise';

// Helper function to convert numeric IDs to string IDs
export const convertExerciseId = (id: number | string): string => {
  return String(id);
};
