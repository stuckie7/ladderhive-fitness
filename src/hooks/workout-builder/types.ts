
// Define types for the workout builder
export interface WorkoutDetail {
  id?: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  goal?: string;
  duration_minutes?: number;
  is_template: boolean;
}

export interface WorkoutExerciseDetail {
  id: string;
  exercise_id: number | string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  name?: string;
  exercise?: any;
  weight?: string;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  category: string;
  is_template: boolean;
  created_at?: string;
}
