
import { supabase } from '@/lib/supabase';
import { Exercise } from '@/types/exercise';
import { toStringId } from '@/utils/id-conversion';

/**
 * Gets suggested exercises for a workout based on category, difficulty, and target muscles
 */
export const getSuggestedExercisesForWorkout = async (
  category: string,
  difficulty: string,
  targetMuscles: string[],
  limit: number = 5,
  includeDetails: boolean = true,
  excludeExerciseIds: string[] = []
): Promise<Exercise[]> => {
  try {
    // Convert exclude IDs to numbers for database query
    const excludeIds = excludeExerciseIds.map(id => parseInt(id, 10));
    
    // Build query
    let query = supabase
      .from('exercises_full')
      .select('*');

    // Apply difficulty filter if provided
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    // Apply target muscle filter
    if (targetMuscles.length > 0) {
      // Create a filter for any matching target muscle
      const muscleFilters = targetMuscles.map(m => `prime_mover_muscle.ilike.%${m}%`);
      query = query.or(muscleFilters.join(','));
    }

    // Apply exclusion filter if we have IDs to exclude
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    // Get results with limit
    const { data: exercises, error } = await query.limit(limit);

    if (error) {
      console.error('Error getting suggested exercises:', error);
      throw error;
    }

    if (!exercises || exercises.length === 0) {
      return [];
    }

    // Convert exercise database records to Exercise type
    const result: Exercise[] = exercises.map(ex => {
      // Create a base exercise object with required properties
      const exercise: Exercise = {
        id: toStringId(ex.id),
        name: ex.name || 'Unknown Exercise',
        muscle_group: ex.prime_mover_muscle || '',
        equipment: ex.primary_equipment || 'Bodyweight',
        difficulty: ex.difficulty || 'Beginner',
        // Safely handle potentially missing properties
        description: '', // Default empty string for description
        // Handle instructions with proper default value
        instructions: [], // Default empty array for instructions
        video_url: ex.short_youtube_demo || '',
        image_url: ex.youtube_thumbnail_url || '',
        video_demonstration_url: ex.short_youtube_demo || '',
        target_muscle_group: ex.prime_mover_muscle || '',
      };

      return exercise;
    });

    return result;
  } catch (error) {
    console.error('Error getting suggested exercises:', error);
    throw error;
  }
};
