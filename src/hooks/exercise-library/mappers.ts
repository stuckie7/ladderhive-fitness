
import { Exercise } from "@/types/exercise";
import { ExerciseFull } from "@/hooks/use-exercises-full";

// Helper function to map ExerciseFull to Exercise
export const mapExerciseFullToExercise = (exerciseFull: ExerciseFull): Exercise => {
  return {
    id: exerciseFull.id.toString(),
    name: exerciseFull.name || '',
    bodyPart: exerciseFull.body_region || '',
    target: exerciseFull.target_muscle_group || '',
    equipment: exerciseFull.primary_equipment || '',
    gifUrl: exerciseFull.short_youtube_demo || '',
    secondaryMuscles: exerciseFull.secondary_muscle ? [exerciseFull.secondary_muscle] : [],
    instructions: [],
    muscle_group: exerciseFull.target_muscle_group || '',
    description: `${exerciseFull.prime_mover_muscle || ''} - ${exerciseFull.mechanics || ''} - ${exerciseFull.force_type || ''}`,
    difficulty: exerciseFull.difficulty || 'Intermediate',
    video_url: exerciseFull.in_depth_youtube_exp || exerciseFull.short_youtube_demo || '',
    image_url: ''
  };
};
