
import { TemplateExercise, WorkoutTemplate } from "../types";

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

// Explicitly define types to avoid deep instantiation issues
export type TemplateFilter = (templates: WorkoutTemplate[]) => WorkoutTemplate[];
