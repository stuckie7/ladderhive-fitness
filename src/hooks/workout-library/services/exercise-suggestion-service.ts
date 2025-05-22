
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

interface SuggestedExercise {
  exercise: ExerciseFull;
  relevanceScore: number;
}

export async function getSuggestedExercisesForWorkout(
  workoutCategory: string,
  workoutDifficulty: string,
  targetMuscles: string[],
  limit: number = 5
): Promise<ExerciseFull[]> {
  try {
    // Get all exercises from the full library
    const { data: exercises, error: fetchError } = await supabase
      .from('exercises_full')
      .select('*')
      .order('difficulty_level', { ascending: true });

    if (fetchError) throw fetchError;

    if (!exercises || exercises.length === 0) {
      return [];
    }

    // Filter and score exercises based on relevance
    const scoredExercises = exercises.map((exercise) => {
      // Make sure to convert the id to string
      const exerciseWithStringId = {
        ...exercise,
        id: String(exercise.id)
      } as ExerciseFull;
      
      const relevanceScore = calculateRelevanceScore(
        exerciseWithStringId,
        workoutCategory,
        workoutDifficulty,
        targetMuscles
      );

      return {
        exercise: exerciseWithStringId,
        relevanceScore,
      } as SuggestedExercise;
    });

    // Sort by relevance and take top N
    const sortedExercises = scoredExercises
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Convert to Exercise type
    return sortedExercises.map((suggested) => suggested.exercise);
  } catch (error) {
    console.error('Error getting suggested exercises:', error);
    throw error;
  }
}

function calculateRelevanceScore(
  exercise: ExerciseFull,
  workoutCategory: string,
  workoutDifficulty: string,
  targetMuscles: string[]
): number {
  let score = 0;

  // Category matching - using body_region as the category field
  if (exercise.body_region === workoutCategory) {
    score += 3;
  } else if (
    workoutCategory.toLowerCase().includes('strength') &&
    exercise.body_region?.toLowerCase().includes('strength')
  ) {
    score += 2;
  } else if (
    workoutCategory.toLowerCase().includes('core') &&
    exercise.body_region?.toLowerCase().includes('core')
  ) {
    score += 2;
  }

  // Difficulty matching - using difficulty_level field
  const exerciseDifficulty = exercise.difficulty_level || 'medium'; // Default to medium if null
  
  if (exerciseDifficulty === workoutDifficulty) {
    score += 2;
  } else if (
    (exerciseDifficulty === 'intermediate' && workoutDifficulty === 'advanced') ||
    (exerciseDifficulty === 'beginner' && workoutDifficulty === 'intermediate')
  ) {
    score += 1;
  } else if (!exerciseDifficulty) {
    // Give partial score for exercises with no difficulty specified
    score += 0.5;
  }

  // Muscle group matching
  const exerciseMuscles = [
    exercise.prime_mover_muscle,
    exercise.secondary_muscle,
    exercise.tertiary_muscle,
  ].filter(Boolean);

  const muscleMatchScore = targetMuscles
    .filter((target) => exerciseMuscles.some((muscle) => 
      muscle && muscle.toLowerCase().includes(target.toLowerCase())
    ))
    .length;

  score += muscleMatchScore * 2;

  return score;
}
