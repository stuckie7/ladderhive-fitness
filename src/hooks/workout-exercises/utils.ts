import { Exercise, ExerciseFull } from "@/types/exercise";

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise: Exercise | ExerciseFull;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
  notes?: string;
  weight?: string | number;
}

export const formatExerciseName = (exercise: Exercise | ExerciseFull | undefined): string => {
  if (!exercise) return 'Unknown Exercise';
  
  // Get primary display name
  const name = exercise.name || 'Unknown Exercise';
  
  // Get equipment specification if available
  const equipment = exercise.equipment || 
                   exercise.primary_equipment || 
                   '';
  
  // If we have both name and equipment, combine them
  if (name && equipment) {
    return `${name} (${equipment})`;
  }
  
  // Otherwise just return the name
  return name;
};

// More utils as needed
