
export interface WorkoutDetail {
  id?: string;
  title: string;
  description?: string;
  difficulty: string;
  category?: string;
  goal?: string;
  duration_minutes?: number;
  is_template?: boolean;
}

export interface WorkoutExerciseDetail {
  id: string;
  exercise_id: string | number;
  sets: number;
  reps: string | number;
  rest_seconds: number;
  weight?: string; // Add this property
  notes?: string;
  order_index: number;
  name: string;
  exercise?: any;
}

// Export WorkoutTemplate for compatibility
export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty: string;
  category: string;
  exercises: number;
}
