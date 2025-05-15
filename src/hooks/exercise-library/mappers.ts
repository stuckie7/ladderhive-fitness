
import { Exercise, ExerciseFull } from "@/types/exercise";

/**
 * Maps a full exercise to the simplified Exercise type
 */
export const mapExerciseFullToExercise = (full: ExerciseFull): Exercise => {
  return {
    id: full.id,
    name: full.name,
    description: full.description || `${full.prime_mover_muscle || ''} exercise using ${full.primary_equipment || 'bodyweight'}`,
    muscle_group: full.prime_mover_muscle || full.target_muscle_group,
    equipment: full.primary_equipment,
    difficulty: full.difficulty,
    video_url: full.short_youtube_demo,
    image_url: full.youtube_thumbnail_url,
    bodyPart: full.body_region,
    target: full.prime_mover_muscle || full.target_muscle_group,
    secondaryMuscles: full.secondary_muscle ? [full.secondary_muscle] : [],
    equipment_needed: full.primary_equipment,
    video_demonstration_url: full.video_demonstration_url || full.short_youtube_demo,
    video_explanation_url: full.video_explanation_url || full.in_depth_youtube_exp,
    // Add additional properties needed for compatibility
    short_youtube_demo: full.short_youtube_demo,
    in_depth_youtube_exp: full.in_depth_youtube_exp,
    prime_mover_muscle: full.prime_mover_muscle,
    secondary_muscle: full.secondary_muscle,
    tertiary_muscle: full.tertiary_muscle,
    primary_equipment: full.primary_equipment,
    secondary_equipment: full.secondary_equipment,
    target_muscle_group: full.target_muscle_group || full.prime_mover_muscle,
    mechanics: full.mechanics,
    force_type: full.force_type,
    posture: full.posture,
    laterality: full.laterality,
    difficulty_level: full.difficulty
  };
};

/**
 * Maps a simple exercise to a ExerciseFull type (for create/update operations)
 */
export const mapExerciseToExerciseFull = (exercise: Exercise): Partial<ExerciseFull> => {
  return {
    name: exercise.name,
    description: exercise.description,
    prime_mover_muscle: exercise.muscle_group || exercise.target || exercise.prime_mover_muscle,
    primary_equipment: exercise.equipment || exercise.equipment_needed || exercise.primary_equipment,
    difficulty: exercise.difficulty || exercise.difficulty_level,
    short_youtube_demo: exercise.video_url || exercise.video_demonstration_url || exercise.short_youtube_demo,
    in_depth_youtube_exp: exercise.video_explanation_url || exercise.in_depth_youtube_exp,
    body_region: exercise.bodyPart,
    youtube_thumbnail_url: exercise.image_url,
    secondary_muscle: exercise.secondary_muscle || (exercise.secondaryMuscles && exercise.secondaryMuscles[0]),
    tertiary_muscle: exercise.tertiary_muscle || (exercise.secondaryMuscles && exercise.secondaryMuscles[1]),
    mechanics: exercise.mechanics,
    force_type: exercise.force_type,
    posture: exercise.posture,
    laterality: exercise.laterality
  };
};
