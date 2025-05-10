
import { WorkoutDetail } from "../types";

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

// Define the WorkoutTemplate type
export interface WorkoutTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
  exercises: TemplateExercise[];
  source_wod_id?: string;
}

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
  exerciseId?: string;
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

// Define TemplateExercise as a distinct type with the required exerciseId field
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: number;
  reps?: string | number;
  rest_seconds?: number;
  notes?: string;
}

// Explicitly define types to avoid deep instantiation issues
export type TemplateFilter = (templates: WorkoutTemplate[]) => WorkoutTemplate[];
