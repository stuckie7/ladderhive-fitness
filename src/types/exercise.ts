
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  // For compatibility with existing code
  muscle_group?: string;
  description?: string;
  difficulty?: string;
  video_url?: string;
  image_url?: string;
  // Additional fields from exercises_full
  mechanics?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  force_type?: string;
  movement_pattern?: string;
  plane_of_motion?: string;
}

export type MuscleGroup = string;
export type Equipment = string;
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}
