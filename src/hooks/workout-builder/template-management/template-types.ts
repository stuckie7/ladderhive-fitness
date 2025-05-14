
// Define template types in a separate file to avoid circular dependencies

// Template exercise type
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: number;
  reps: string | number; // Allow both string and number, but make it required
  rest_seconds?: number;
  notes?: string;
}

// Simplified template type (to avoid recursive type issues)
export interface SimplifiedWorkoutTemplate {
  id?: string;
  title: string;
  name?: string; // Make name optional to match other definition
  description?: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
  source_wod_id?: string;
}

// Full template type 
export interface WorkoutTemplate extends SimplifiedWorkoutTemplate {
  exercises: TemplateExercise[];
}

// Export this type explicitly to prevent import errors
export type ExerciseTemplate = TemplateExercise;
