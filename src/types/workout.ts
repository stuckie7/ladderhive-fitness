// Define types for workout data
export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exercises: number;
  difficulty: string;
  date?: string;
  isSaved?: boolean;
  category?: string; // Add optional category property
}

export interface UserWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  status: string;
  completed_at: string | null;
  planned_for: string | null;
  workout: Workout;
  date?: string;
}

// Types for prepared workouts
export interface PreparedWorkout {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  difficulty: string;
  category: string;
  goal: string;
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
  is_template?: boolean;
  exercises?: number; // For compatibility with Workout interface
}

export interface PreparedWorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
  notes?: string;
  exercise?: any; // Will be populated with exercise data when fetched
}
