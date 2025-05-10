
import { ExerciseFull } from "@/types/exercise";

export interface WorkoutExerciseDetail {
  id: string;
  exercise_id: number;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: string;
  notes?: string;
  exercise?: ExerciseFull;
}

export interface WorkoutDetail {
  id?: string;
  title: string;
  description?: string;
  difficulty: string;
  category: string;
  duration_minutes?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  is_template?: boolean;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  created_at: string;
}
