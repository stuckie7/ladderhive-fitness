
import { WorkoutTemplate as BaseWorkoutTemplate } from "../types";

// Define a simplified type for workout input to avoid recursive type issues
export interface WorkoutInput {
  id?: string;
  title: string;
  description?: string; 
  exercises?: Array<{
    id: string;
    name?: string;
    sets?: number;
    reps?: string | number;
    weight?: number | string;
    duration?: number;
  }>;
}

// Export the WorkoutTemplate type from the base types
export type { BaseWorkoutTemplate as WorkoutTemplate };

// Define the TemplateSet type
export interface TemplateSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
}

// Define the ExerciseTemplate type
export interface ExerciseTemplate {
  id: string;
  name: string;
  exerciseId: string; // Required property
  category?: string;
  equipment?: string;
  primaryMuscle?: string;
  secondaryMuscles?: string[];
  description?: string;
  sets: number;
  reps: string | number;
  weight?: number | string;
  restTime?: number;
  rest_seconds?: number;
  duration?: number;
  notes?: string;
  order_index?: number;
  order?: number;
  exercise_id?: string | number;
}

// Explicitly define TemplateExercise to match ExerciseTemplate structure
export type TemplateExercise = ExerciseTemplate;

// Explicitly define types to avoid deep instantiation issues
export type TemplateFilter = (templates: BaseWorkoutTemplate[]) => BaseWorkoutTemplate[];
