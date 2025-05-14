
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
