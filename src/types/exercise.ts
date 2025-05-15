
// Export type definitions
export interface Exercise {
  id: string | number;
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  instructions?: string[];
  video_url?: string;
  image_url?: string;
  bodyPart?: string;
  target?: string;
  secondaryMuscles?: string[];
  equipment_needed?: string;
  video_demonstration_url?: string;
  video_explanation_url?: string;
  // Add properties needed by components
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  primary_equipment?: string;
  secondary_equipment?: string;
  mechanics?: string;
  force_type?: string;
  posture?: string;
  laterality?: string;
  difficulty_level?: string;
  youtube_thumbnail_url?: string;
  body_region?: string;
  target_muscle_group?: string; // Added to fix component errors
  gifUrl?: string; // Added for compatibility
}

export interface ExerciseFull {
  id: string | number;
  name: string;
  primary_items_count?: number;
  secondary_items_count?: number;
  combination_exercise?: boolean;
  created_at?: string;
  updated_at?: string;
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  difficulty?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  primary_equipment?: string;
  secondary_equipment?: string;
  posture?: string;
  single_or_double_arm?: string;
  arm_movement_pattern?: string;
  grip?: string;
  load_position?: string;
  leg_movement_pattern?: string;
  foot_elevation?: string;
  movement_pattern_1?: string;
  movement_pattern_2?: string;
  movement_pattern_3?: string;
  plane_of_motion_1?: string;
  plane_of_motion_2?: string;
  plane_of_motion_3?: string;
  body_region?: string;
  force_type?: string;
  mechanics?: string;
  laterality?: string;
  exercise_classification?: string;
  youtube_thumbnail_url?: string;
  description?: string;
  instructions?: string[];
  video_demonstration_url?: string;
  video_explanation_url?: string;
  image_url?: string;
  // Add compatible properties from Exercise interface
  equipment?: string;
  bodyPart?: string;
  target?: string;
  gifUrl?: string;
  muscle_group?: string;
  video_url?: string;
  target_muscle_group?: string;
}

export interface FilterOptions {
  muscleGroups: string[];
  equipment: string[];
  difficulty: string[];
  bodyParts: string[];
}

export interface SuggestedExercise {
  id: number;
  name: string;
  target?: string;
  bodyPart?: string;
  equipment?: string;
  gifUrl?: string;
}

export interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}
