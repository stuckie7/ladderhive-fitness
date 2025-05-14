
import { Exercise } from "@/types/exercise";

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  weight: string | null;
  rest_time: number;
  order_index: number;
  exercise?: Exercise;
}

/**
 * Ensures that reps is always stored as a string
 * This helps with supporting ranges like "8-12" or "to failure"
 */
export const ensureStringReps = (reps: string | number | null | undefined): string => {
  if (reps === null || reps === undefined) {
    return "10";
  }
  return String(reps);
};

/**
 * Maps a Supabase exercise object to our Exercise type
 */
export const mapSupabaseExerciseToExercise = (exerciseData: any): Exercise => {
  return {
    id: exerciseData.id,
    name: exerciseData.name || '',
    description: exerciseData.description || '',
    muscle_group: exerciseData.target_muscle_group || exerciseData.prime_mover_muscle || exerciseData.muscle_group,
    equipment: exerciseData.primary_equipment || exerciseData.equipment,
    difficulty: exerciseData.difficulty || exerciseData.difficulty_level,
    instructions: Array.isArray(exerciseData.instructions) ? exerciseData.instructions : 
      (exerciseData.instructions ? [exerciseData.instructions] : []),
    video_url: exerciseData.video_url || exerciseData.short_youtube_demo || exerciseData.video_demonstration_url,
    image_url: exerciseData.image_url || exerciseData.youtube_thumbnail_url,
    bodyPart: exerciseData.body_region,
    target: exerciseData.target_muscle_group || exerciseData.prime_mover_muscle,
    secondaryMuscles: [
      exerciseData.secondary_muscle,
      exerciseData.tertiary_muscle
    ].filter(Boolean),
    video_demonstration_url: exerciseData.video_demonstration_url || exerciseData.short_youtube_demo,
  };
};
