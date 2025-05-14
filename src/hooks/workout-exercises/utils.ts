
import { Exercise } from "@/types/exercise";

// Define the shape of the data coming from Supabase
export interface SupabaseExercise {
  id: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string; // Changed to string for consistency
  sets: number;
  reps: string | number; // Allow both number and string for flexibility
  weight?: string;
  rest_time?: number;
  order_index: number;
  notes?: string; // Added notes field
  exercise?: Exercise | any; // Allow any to handle different exercise types
}

// Helper function to map Supabase exercise data to our Exercise type
export const mapSupabaseExerciseToExercise = (supabaseExercise: SupabaseExercise): Exercise => {
  return {
    id: supabaseExercise.id,
    name: supabaseExercise.name,
    bodyPart: supabaseExercise.muscle_group || "",
    target: supabaseExercise.muscle_group || "", // Default target to muscle_group if available
    equipment: supabaseExercise.equipment || "",
    muscle_group: supabaseExercise.muscle_group,
    description: supabaseExercise.description,
    difficulty: supabaseExercise.difficulty as any,
    image_url: supabaseExercise.image_url,
    video_url: supabaseExercise.video_url
  };
};

// Helper function to ensure consistency in reps format
export const ensureStringReps = (reps: string | number | undefined): string => {
  if (typeof reps === 'undefined') return "10";
  return reps.toString();
};
