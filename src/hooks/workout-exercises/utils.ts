
import { Exercise } from "@/types/exercise";

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string; // Must be string to handle ranges like "8-12"
  weight: string | null;
  rest_time: number;
  order_index: number;
  exercise?: Exercise;
}

// Helper function to ensure reps is always a string
export const ensureStringReps = (reps: string | number | undefined): string => {
  if (typeof reps === 'undefined') return '10';
  return typeof reps === 'string' ? reps : String(reps);
};

// Helper to map a Supabase exercise result to our Exercise type
export const mapSupabaseExerciseToExercise = (exerciseData: any): Exercise => {
  return {
    id: String(exerciseData.id), // Ensure ID is a string
    name: exerciseData.name || '',
    description: exerciseData.description || '',
    muscle_group: exerciseData.prime_mover_muscle || exerciseData.target_muscle_group || exerciseData.muscle_group || '',
    equipment: exerciseData.primary_equipment || exerciseData.equipment || '',
    difficulty: exerciseData.difficulty || '',
    video_url: exerciseData.video_url || exerciseData.short_youtube_demo || '',
    image_url: exerciseData.image_url || exerciseData.youtube_thumbnail_url || '',
    video_demonstration_url: exerciseData.video_demonstration_url || exerciseData.short_youtube_demo || '',
    // Map other fields as needed
  };
};
