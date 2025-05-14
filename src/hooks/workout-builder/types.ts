
// Define workout-related types for the workout builder

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
  id?: string;
  exercise_id: number | string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: string; // Add weight property
  notes?: string;
  order_index?: number;
  name?: string;
  exercise?: any; // Will be populated with exercise data when fetched
}

export interface WorkoutBuilderState {
  workout: WorkoutDetail;
  exercises: WorkoutExerciseDetail[];
  isLoading: boolean;
  isSaving: boolean;
  templates: any[];
}

// Add this to fix export errors in other files
export interface WorkoutTemplate {
  id?: string;
  title: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
  source_wod_id?: string;
  exercises: any[];
}
