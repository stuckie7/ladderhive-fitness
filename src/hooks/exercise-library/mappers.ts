
import { Exercise, ExerciseFull } from "@/types/exercise";

export const mapExerciseFullToExercise = (exerciseFull: ExerciseFull): Exercise => {
  return {
    id: exerciseFull.id.toString(), // Convert number id to string
    name: exerciseFull.name || '',
    bodyPart: exerciseFull.body_region || '',
    target: exerciseFull.prime_mover_muscle || '',
    equipment: exerciseFull.primary_equipment || '',
    difficulty: exerciseFull.difficulty || 'Intermediate',
    difficulty_level: exerciseFull.difficulty || 'Intermediate',
    muscle_group: exerciseFull.prime_mover_muscle || '',
    description: `${exerciseFull.prime_mover_muscle || ''} - ${exerciseFull.mechanics || ''}`,
    video_url: exerciseFull.in_depth_youtube_exp || exerciseFull.short_youtube_demo || '',
    image_url: '',
    secondaryMuscles: exerciseFull.secondary_muscle ? [exerciseFull.secondary_muscle] : [],
    gifUrl: exerciseFull.short_youtube_demo || null,
    exercise_classification: exerciseFull.exercise_classification,
    // Include other properties from ExerciseFull as needed
    short_youtube_demo: exerciseFull.short_youtube_demo,
    in_depth_youtube_exp: exerciseFull.in_depth_youtube_exp,
    prime_mover_muscle: exerciseFull.prime_mover_muscle,
    secondary_muscle: exerciseFull.secondary_muscle,
    tertiary_muscle: exerciseFull.tertiary_muscle,
    primary_equipment: exerciseFull.primary_equipment,
    secondary_equipment: exerciseFull.secondary_equipment,
    posture: exerciseFull.posture,
    movement_pattern_1: exerciseFull.movement_pattern_1,
    movement_pattern_2: exerciseFull.movement_pattern_2,
    movement_pattern_3: exerciseFull.movement_pattern_3,
    plane_of_motion_1: exerciseFull.plane_of_motion_1,
    plane_of_motion_2: exerciseFull.plane_of_motion_2,
    plane_of_motion_3: exerciseFull.plane_of_motion_3,
    body_region: exerciseFull.body_region,
    force_type: exerciseFull.force_type,
    mechanics: exerciseFull.mechanics,
    laterality: exerciseFull.laterality,
    youtube_thumbnail_url: exerciseFull.youtube_thumbnail_url || null,
    
    // Map the compatibility fields
    target_muscle_group: exerciseFull.prime_mover_muscle,
    video_demonstration_url: exerciseFull.short_youtube_demo,
    video_explanation_url: exerciseFull.in_depth_youtube_exp
  };
};
