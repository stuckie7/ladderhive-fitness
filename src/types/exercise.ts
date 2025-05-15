export interface Exercise {
  id: string;
  name: string;
  short_youtube_demo?: string | null;
  in_depth_youtube_exp?: string | null;
  difficulty?: string | null;
  prime_mover_muscle?: string | null;
  secondary_muscle?: string | null;
  tertiary_muscle?: string | null;
  primary_equipment?: string | null;
  secondary_equipment?: string | null;
  posture?: string | null;
  movement_pattern_1?: string | null;
  movement_pattern_2?: string | null;
  movement_pattern_3?: string | null;
  plane_of_motion_1?: string | null;
  plane_of_motion_2?: string | null;
  plane_of_motion_3?: string | null;
  body_region?: string | null;
  force_type?: string | null;
  mechanics?: string | null;
  laterality?: string | null;
  youtube_thumbnail_url?: string | null;
  
  // Compatibility fields for UI components
  bodyPart?: string;
  target?: string;
  equipment?: string;
  description?: string;
  instructions?: string[];
  muscle_group?: string;
  video_url?: string;
  image_url?: string;
  secondaryMuscles?: string[];
  difficulty_level?: string;
  gifUrl?: string | null;
  exercise_classification?: string | null;
  
  // Mapped fields for backward compatibility
  target_muscle_group?: string | null;
  video_demonstration_url?: string | null;
  video_explanation_url?: string | null;
}

export interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

export interface ExerciseFull {
  id: number;
  name: string | null;
  short_youtube_demo: string | null;
  in_depth_youtube_exp: string | null;
  difficulty: string | null;
  prime_mover_muscle: string | null;
  secondary_muscle: string | null;
  tertiary_muscle: string | null;
  primary_equipment: string | null;
  secondary_equipment: string | null;
  posture: string | null;
  movement_pattern_1: string | null;
  movement_pattern_2: string | null;
  movement_pattern_3: string | null;
  plane_of_motion_1: string | null;
  plane_of_motion_2: string | null;
  plane_of_motion_3: string | null;
  body_region: string | null;
  force_type: string | null;
  mechanics: string | null;
  laterality: string | null;
  youtube_thumbnail_url?: string | null;
  
  // Add the missing properties to match database
  target_muscle_group: string | null;
  video_demonstration_url: string | null;
  video_explanation_url: string | null;
  
  // Additional fields from the Supabase exercises_full table
  primary_items_count: number | null;
  secondary_items_count: number | null;
  combination_exercise: boolean | null;
  single_or_double_arm: string | null;
  arm_movement_pattern: string | null;
  grip: string | null;
  load_position: string | null;
  leg_movement_pattern: string | null;
  foot_elevation: string | null;
  exercise_classification: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Add description property that's used in components
  description?: string | null;
}
