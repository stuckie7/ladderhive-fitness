// types/exercise.ts
export interface ExerciseFull {
  id: number;
  empty_column?: string | null;
  name: string | null;
  short_youtube_demo: string | null;
  in_depth_youtube_exp: string | null;
  difficulty: string | null;
  target_muscle_group: string | null;
  prime_mover_muscle: string | null;
  secondary_muscle: string | null;
  tertiary_muscle: string | null;
  primary_equipment: string | null;
  primary_items_count: number | null;
  secondary_equipment: string | null;
  secondary_items_count: number | null;
  posture: string | null;
  single_or_double_arm: string | null;
  arm_movement_pattern: string | null;
  grip: string | null;
  load_position: string | null;
  leg_movement_pattern: string | null;
  foot_elevation: string | null;
  combination_exercise: boolean | null;
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
  exercise_classification: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Add the missing properties
  video_demonstration_url?: string | null;
  video_explanation_url?: string | null;
}
