
import { WorkoutTemplate as BaseWorkoutTemplate } from "../types";

// Define a simplified type for workout input to avoid recursive type issues
export interface WorkoutInput {
  id?: string;
  title: string;
  description?: string; 
  exercises?: Array<{
    id: string;
    name?: string;
    sets?: Array<{
      id: string;
      reps: number;
      weight?: number;
      duration?: number;
    }>;
  }>;
}

// Export the WorkoutTemplate type from the base types
export type { BaseWorkoutTemplate as WorkoutTemplate };

// Define the ExerciseTemplate type
export interface ExerciseTemplate {
  id: string;
  name: string;
  category?: string;
  equipment?: string;
  primaryMuscle?: string;
  secondaryMuscles?: string[];
  description?: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  duration?: number;
  notes?: string;
  order?: number;
}

// Explicitly define types to avoid deep instantiation issues
export type TemplateFilter = (templates: BaseWorkoutTemplate[]) => BaseWorkoutTemplate[];
