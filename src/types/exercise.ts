export interface Exercise {
  id: number;
  empty_column: string | null;
  name: string;
  short_youtube_demo: string;
  in_depth_youtube_exp: string;
  difficulty: string;
  target_muscle_group: string;
  prime_mover_muscle: string;
  secondary_muscle: string;
  tertiary_muscle: string;
  primary_equipment: string;
  primary_items_count: number;
  secondary_equipment: string;
  secondary_items_count: number;
  posture: string;
  single_or_double_arm: string;
  arm_movement_pattern: string;
  grip: string;
  load_position: string;
  leg_movement_pattern: string;
  foot_elevation: string;
  combination_exercise: string;
  movement_pattern_1: string;
  movement_pattern_2: string;
  movement_pattern_3: string;
  plane_of_motion_1: string;
}
