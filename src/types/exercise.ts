
// Export type definitions
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string[] | string;
  video_url?: string;
  image_url?: string;
  body_region?: string;
  mechanics?: string;
  force_type?: string;
  posture?: string;
  laterality?: string;
  arm_movement_pattern?: string;
  foot_elevation?: string;
  combination_exercise?: boolean;
  created_at?: string;
  updated_at?: string;
  difficulty?: string;
  difficulty_level?: string;
  exercise_classification?: string;
  target_muscle_group?: string;
  gifUrl?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  primary_equipment?: string;
  secondary_equipment?: string;
  equipment?: string;
  bodyPart?: string;
  target?: string;
  equipment_needed?: string;
  secondaryMuscles?: string[];
  muscle_group?: string;
  muscle_groups?: string[];
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  video_demonstration_url?: string;
  video_explanation_url?: string;
  youtube_thumbnail_url?: string;
  single_or_double_arm?: string;
  grip?: string;
  load_position?: string;
  leg_movement_pattern?: string;
  movement_pattern_1?: string;
  movement_pattern_2?: string;
  movement_pattern_3?: string;
  plane_of_motion_1?: string;
  plane_of_motion_2?: string;
  plane_of_motion_3?: string;
}

export interface ExerciseFull {
  id: string;
  name: string;
  description?: string;
  instructions?: string[] | string;
  video_url?: string;
  image_url?: string;
  body_region?: string;
  mechanics?: string;
  force_type?: string;
  laterality?: string;
  arm_movement_pattern?: string;
  foot_elevation?: string;
  combination_exercise?: boolean;
  created_at?: string;
  updated_at?: string;
  difficulty?: string;
  difficulty_level?: string;
  exercise_classification?: string;
  target_muscle_group?: string;
  gifUrl?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  primary_equipment?: string;
  secondary_equipment?: string;
  posture?: string;
  video_demonstration_url?: string;
  video_explanation_url?: string;
  youtube_thumbnail_url?: string;
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  single_or_double_arm?: string;
  grip?: string;
  load_position?: string;
  leg_movement_pattern?: string;
  movement_pattern_1?: string;
  movement_pattern_2?: string;
  movement_pattern_3?: string;
  plane_of_motion_1?: string;
  plane_of_motion_2?: string;
  plane_of_motion_3?: string;
  equipment?: string;
  bodyPart?: string;
  target?: string;
  equipment_needed?: string;
  secondaryMuscles?: string[];
  muscle_group?: string;
  muscle_groups?: string[];
}

// Keep the rest of the interfaces the same
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
