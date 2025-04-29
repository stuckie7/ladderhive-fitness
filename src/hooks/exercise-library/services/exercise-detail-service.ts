
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const getExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
  try {
    console.log(`Fetching exercise with ID ${id}`);
    
    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching exercise with ID ${id}:`, error);
      throw error;
    }
    
    // Transform the data to match our ExerciseFull type
    if (data) {
      const exerciseData: ExerciseFull = {
        ...data,
        // Add the missing properties with default null values
        video_demonstration_url: data.short_youtube_demo || null,
        video_explanation_url: data.in_depth_youtube_exp || null
      };
      return exerciseData;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch exercise with ID ${id}:`, error);
    throw error;
  }
};
