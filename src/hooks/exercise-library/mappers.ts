
import { ExerciseFull, Exercise } from '@/types/exercise';

/**
 * Maps an ExerciseFull object to a normalized Exercise object.
 * Ensures that the ID is always converted to a string.
 */
export const mapExerciseFullToExercise = (exerciseFull: any): Exercise => {
  if (!exerciseFull) return {} as Exercise;

  return {
    ...exerciseFull,
    id: String(exerciseFull.id), // Ensure ID is a string
    name: exerciseFull.name || '',
    description: exerciseFull.description,
    muscle_group: exerciseFull.prime_mover_muscle || exerciseFull.target_muscle_group,
    muscle_groups: exerciseFull.muscle_groups || [exerciseFull.prime_mover_muscle].filter(Boolean),
    equipment: exerciseFull.primary_equipment || exerciseFull.equipment,
    difficulty: exerciseFull.difficulty || exerciseFull.difficulty_level,
    instructions: exerciseFull.instructions,
    video_url: exerciseFull.video_url,
    image_url: exerciseFull.image_url,
    short_youtube_demo: exerciseFull.short_youtube_demo,
    in_depth_youtube_exp: exerciseFull.in_depth_youtube_exp,
    video_demonstration_url: exerciseFull.video_demonstration_url || exerciseFull.short_youtube_demo,
    video_explanation_url: exerciseFull.video_explanation_url || exerciseFull.in_depth_youtube_exp,
    youtube_thumbnail_url: exerciseFull.youtube_thumbnail_url
  };
};

/**
 * Maps an array of ExerciseFull objects to normalized Exercise objects.
 */
export const mapExercisesFullToExercises = (exercisesFull: any[]): Exercise[] => {
  return (exercisesFull || []).map(mapExerciseFullToExercise);
};

/**
 * Ensures that an exercise ID is always a string.
 */
export const normalizeExerciseId = (id: string | number): string => {
  return String(id);
};
