
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
  thumbnail_url?: string; // Add thumbnail_url property
}

export interface WorkoutDetail extends Workout {
  // Add any additional properties specific to a detailed workout view
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

// Add WorkoutExercise interface
export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds: number;
  order_index: number;
  notes?: string;
  exercise?: any; // Exercise details
  rest_time?: number; // For backward compatibility
}
