
import { Exercise } from "@/types/exercise";

// Ensure all required properties are included in the type definition
export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string | number; // Make it accept both string and number
  sets: number;
  reps: string | number; // Support both string and number formats for reps
  rest_time?: number;
  rest_seconds?: number; // Add rest_seconds as optional
  order_index: number;
  weight?: string | number; // Make weight optional and support both string and number
  notes?: string; // Make notes optional
  exercise?: Exercise;
}

// Utility function to ensure reps are always strings
export const ensureStringReps = (reps: string | number): string => {
  if (typeof reps === 'number') {
    return reps.toString();
  }
  return reps;
};
