// Update the WorkoutTemplate interface to align with Supabase table structure
export interface WorkoutExerciseDetail {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
  exercise_id: string;
}

export interface WorkoutDetail {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  duration_minutes: number;
  exercises: number;
  category?: string;
  created_at?: string;
}

// Updated WorkoutTemplate to align with prepared_workouts table
export interface WorkoutTemplate {
  id: string;
  name: string;         // For backward compatibility
  title: string;        // Matches prepared_workouts table
  exercises: TemplateExercise[];
  isCircuit?: boolean;
  category?: string;    // Added to match prepared_workouts
  difficulty?: string;  // Added to match prepared_workouts
  created_at?: string;  // Added to match prepared_workouts
}

// Keep TemplateExercise as is since it's a simplified view for the UI
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: TemplateSet[];
  restSeconds?: number;
}

export interface TemplateSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
}
