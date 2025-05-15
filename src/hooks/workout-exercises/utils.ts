
import { Exercise, ExerciseFull } from '@/types/exercise';
import { WorkoutExercise } from '@/types/workout';

/**
 * Ensures that the reps property is always a string
 * @param reps - Reps value that could be string or number
 * @returns reps as a string
 */
export const ensureStringReps = (reps: string | number | undefined): string => {
  if (reps === undefined) return '';
  return reps.toString();
};

/**
 * Reorders workout exercises by updating their order_index
 * @param exercises - Array of workout exercises to reorder
 * @param startIndex - Starting position
 * @param endIndex - Target position
 * @returns Reordered exercises array
 */
export const reorderExercises = (
  exercises: WorkoutExercise[], 
  startIndex: number, 
  endIndex: number
): WorkoutExercise[] => {
  // Make a copy of the exercises array
  const result = [...exercises];
  
  // Remove the item from the array
  const [removed] = result.splice(startIndex, 1);
  
  // Insert the item at the new position
  result.splice(endIndex, 0, removed);
  
  // Update the order_index property for each item
  return result.map((exercise, index) => ({
    ...exercise,
    order_index: index
  }));
};

/**
 * Maps exercise full data to exercise type
 * @param exerciseFull - Full exercise data
 * @returns Exercise object
 */
export const mapExerciseFullToExercise = (exerciseFull: ExerciseFull): Exercise => {
  return {
    id: exerciseFull.id,
    name: exerciseFull.name,
    description: exerciseFull.description || '',
    muscle_group: exerciseFull.prime_mover_muscle || '',
    equipment: exerciseFull.primary_equipment || '',
    difficulty: exerciseFull.difficulty || '',
    instructions: exerciseFull.instructions || [],
    video_url: exerciseFull.short_youtube_demo || exerciseFull.video_demonstration_url || '',
    image_url: exerciseFull.image_url || exerciseFull.youtube_thumbnail_url || '',
    bodyPart: exerciseFull.body_region || '',
    target: exerciseFull.prime_mover_muscle || '',
    secondary_muscle: exerciseFull.secondary_muscle,
    tertiary_muscle: exerciseFull.tertiary_muscle,
    primary_equipment: exerciseFull.primary_equipment,
    body_region: exerciseFull.body_region,
    target_muscle_group: exerciseFull.prime_mover_muscle || exerciseFull.target_muscle_group
  };
};

// Export the WorkoutExercise type from the workout-exercises module
export type { WorkoutExercise } from '@/types/workout';
