
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const getExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
  try {
    console.log(`Fetching exercise with ID ${id}`);
    
    const response = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', id)
      .single();
    
    if (response.error) {
      console.error(`Error fetching exercise with ID ${id}:`, response.error);
      throw response.error;
    }
    
    const { data } = response;
    console.log(`Exercise data found:`, data ? 'Yes' : 'No');
    
    // Transform the data to match our ExerciseFull type
    if (data) {
      const exerciseData: ExerciseFull = {
        ...data,
        // Map properties correctly using optional chaining
        target_muscle_group: data.prime_mover_muscle || null,
        video_demonstration_url: data.short_youtube_demo || null,
        video_explanation_url: data.in_depth_youtube_exp || null
      } as ExerciseFull;
      return exerciseData;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch exercise with ID ${id}:`, error);
    throw error;
  }
};
