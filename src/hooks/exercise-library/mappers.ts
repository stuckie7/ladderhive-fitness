
import { Exercise, ExerciseFull } from "@/types/exercise";

export const mapExerciseFullToExercise = (exerciseFull: ExerciseFull): Exercise => {
  return {
    id: exerciseFull.id.toString(),
    name: exerciseFull.name || '',
    bodyPart: exerciseFull.body_region || '',
    target: exerciseFull.target_muscle_group || '',
    equipment: exerciseFull.primary_equipment || '',
    muscle_group: exerciseFull.target_muscle_group || '',
    description: `${exerciseFull.prime_mover_muscle || ''} - ${exerciseFull.mechanics || ''} - ${exerciseFull.force_type || ''}`,
    difficulty: exerciseFull.difficulty || 'Intermediate',
    video_url: exerciseFull.in_depth_youtube_exp || exerciseFull.short_youtube_demo || '',
    image_url: exerciseFull.short_youtube_demo || '',
    secondaryMuscles: exerciseFull.secondary_muscle ? [exerciseFull.secondary_muscle] : [],
    instructions: [],
    gifUrl: exerciseFull.short_youtube_demo || '',
    video_demonstration_url: exerciseFull.video_demonstration_url || '',
    video_explanation_url: exerciseFull.video_explanation_url || '',
    
    // Map all the original properties
    target_muscle_group: exerciseFull.target_muscle_group,
    prime_mover_muscle: exerciseFull.prime_mover_muscle,
    secondary_muscle: exerciseFull.secondary_muscle,
    tertiary_muscle: exerciseFull.tertiary_muscle,
    primary_equipment: exerciseFull.primary_equipment,
    secondary_equipment: exerciseFull.secondary_equipment,
    mechanics: exerciseFull.mechanics,
    force_type: exerciseFull.force_type,
    body_region: exerciseFull.body_region,
    movement_pattern_1: exerciseFull.movement_pattern_1,
    plane_of_motion_1: exerciseFull.plane_of_motion_1,
    short_youtube_demo: exerciseFull.short_youtube_demo,
    in_depth_youtube_exp: exerciseFull.in_depth_youtube_exp,
    laterality: exerciseFull.laterality
  };
};
