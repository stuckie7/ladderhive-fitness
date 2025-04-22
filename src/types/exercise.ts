
export interface Exercise {
  id: string;
  name: string;
  empty_column?: string | null;
  short_youtube_demo?: string | null;
  in_depth_youtube_exp?: string | null;
  difficulty?: string | null;
  target_muscle_group?: string | null;
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
}

export interface ExerciseFilters {
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}
