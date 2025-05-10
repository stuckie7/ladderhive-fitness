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
  exercise_id: string | number;
  exercise?: any; // Add this field to support exercise details
}

export interface WorkoutDetail {
  id?: string;
  title: string;
  description?: string;
  difficulty: string;
  duration: number;  // Use this for backwards compatibility
  duration_minutes?: number;  // Add this for new code
  exercises: WorkoutExerciseDetail[]; // Changed from number to array
  category?: string;
  created_at?: string;
  updated_at?: string;
  is_template?: boolean; 
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
  description?: string; // Add this field to match the table and fix errors
  source_wod_id?: string; // Add this field for WOD references
}

// Keep TemplateExercise as is since it's a simplified view for the UI
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: number;
  reps?: string | number;
  rest_seconds?: number;
  notes?: string;
}

export interface TemplateSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
}

// Add this interface for connecting WODs to templates
export interface WorkoutTemplateWithWod extends WorkoutTemplate {
  source_wod_id?: string;
}
