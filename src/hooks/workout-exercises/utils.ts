
// Define types for workout exercises
export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  rest_time?: number;
  rest_seconds?: number;
  order_index: number;
  weight?: string;
  notes?: string;
  exercise?: any;
}

// Helper to ensure reps is always a string
export const ensureStringReps = (reps: string | number | null | undefined): string => {
  if (reps === null || reps === undefined) return '10';
  return String(reps);
};

