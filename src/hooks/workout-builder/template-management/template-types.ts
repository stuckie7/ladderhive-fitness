
// Define template types in a separate file to avoid circular dependencies

// Template exercise type
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: number;
  reps: string | number; // Make reps required, not optional
  rest_seconds?: number;
  notes?: string;
}

// Simplified template type (to avoid recursive type issues)
export interface SimplifiedWorkoutTemplate {
  id?: string;
  title: string;
  name?: string; 
  description?: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
  source_wod_id?: string;
}

// Full template type 
export interface WorkoutTemplate extends SimplifiedWorkoutTemplate {
  id: string; // Make id required to match the other template type
  exercises: TemplateExercise[];
}

// Export this type explicitly to prevent import errors
export type ExerciseTemplate = TemplateExercise;
