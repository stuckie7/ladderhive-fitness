
// Update the WorkoutTemplate interface to align with Supabase table structure
export interface WorkoutExerciseDetail {
  id: string;
  name: string;
  sets: number;
  reps: string | number; // Support both string and number for reps
  weight?: string;
  rest_seconds?: number;
  notes?: string;
  order_index: number;
  exercise_id: string | number; // Support both string and number for exercise_id
  exercise?: any; // Add this field to support exercise details
}

export interface WorkoutDetail {
  id?: string;
  title: string;
  description?: string;
  difficulty: string;
  duration?: number;  // Use this for backwards compatibility
  duration_minutes?: number;  // Add this for new code
  exercises: WorkoutExerciseDetail[]; // Always use array of exercises
  category?: string;
  goal?: string;  // Add this property to match the Supabase table structure
  created_at?: string;
  updated_at?: string;
  is_template?: boolean;
  thumbnail_url?: string;
  trainer?: string;
  is_new?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
}

// Updated WorkoutTemplate to align with prepared_workouts table and template-types.ts
export interface WorkoutTemplate {
  id: string; // Make id required to match template-types
  name?: string;         // For backward compatibility
  title: string;        // Matches prepared_workouts table
  exercises: TemplateExercise[];
  isCircuit?: boolean;
  category?: string;    // Added to match prepared_workouts
  difficulty?: string;  // Added to match prepared_workouts
  created_at?: string;  // Added to match prepared_workouts
  description?: string; // Add this field to match the table and fix errors
  source_wod_id?: string; // Add this field for WOD references
  is_template?: boolean; // Add this field for template flag
}

// Break recursive dependency to fix infinite type instantiation error
export type SimplifiedWorkoutTemplate = {
  id: string; // Make id required to match template-types
  name?: string;
  title: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
  description?: string;
  source_wod_id?: string;
};

// Keep TemplateExercise as is since it's a simplified view for the UI
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: number;
  reps: string | number; // Make consistent with template-types
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
