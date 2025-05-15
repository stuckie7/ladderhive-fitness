import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

/**
 * Fetches a single exercise by ID
 */
export const getExerciseFullById = async (
  id: string | number
): Promise<ExerciseFull | null> => {
  try {
    // Ensure numeric ID
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(Number(numericId))) {
      throw new Error(`Invalid exercise ID: ${id}`);
    }

    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', numericId)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    // Create a typed ExerciseFull object with default values for missing properties
    const exerciseFull: ExerciseFull = {
      ...data,
      // Add description with a default if it doesn't exist
      description: data.description || data.name || '',
      // Add other potentially missing fields with defaults
      id: data.id,
      name: data.name || 'Unknown Exercise',
      // Ensure all required properties have fallbacks
      target_muscle_group: data.target_muscle_group || data.prime_mover_muscle || '',
      video_demonstration_url: data.video_demonstration_url || data.short_youtube_demo || '',
      video_explanation_url: data.video_explanation_url || data.in_depth_youtube_exp || ''
    };
    
    return exerciseFull;
  } catch (error) {
    console.error('Failed to fetch exercise details:', error);
    return null;
  }
};
