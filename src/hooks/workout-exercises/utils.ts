
import { Exercise } from '@/types/exercise';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds: number;
  rest_time?: number; // For compatibility with older data
  order_index: number;
  notes?: string;
  exercise?: Exercise;
}

// Ensure reps is always a string
export const ensureStringReps = (reps: string | number): string => {
  if (typeof reps === 'number') {
    return reps.toString();
  }
  return reps || '';
};

// Convert IDs to the correct type as needed
export const ensureIdFormat = (id: string | number): string => {
  return id.toString();
};
