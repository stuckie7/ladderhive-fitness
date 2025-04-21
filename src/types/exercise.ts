
// types/exercise.ts
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl?: string;
  secondaryMuscles?: string[];
  instructions?: string[];
  
  // Legacy fields (for backward compatibility)
  muscle_group?: string;    // Maps to `bodyPart` or `body_region`
  description?: string;     // Maps to `instructions`
  difficulty?: string;      // Maps to `difficulty_level`
  video_url?: string;       // Maps to `video_explanation_url`
  image_url?: string;       // Maps to `gifUrl`

  // Fields from `exercises_full`
  mechanics?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  force_type?: string;
  movement_pattern?: string;
  plane_of_motion?: string;

  // Fields from `exercises_new`
  target_muscle_group?: string;
  primary_equipment?: string;
  secondary_equipment?: string;
  posture?: string;
  laterality?: string;
  video_demonstration_url?: string;
  video_explanation_url?: string;
  difficulty_level?: string;
  body_region?: string;
  exercise_classification?: string;
}

export type MuscleGroup = string;
export type Equipment = string;
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}
