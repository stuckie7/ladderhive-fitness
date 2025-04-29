
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const fetchExercisesFull = async (
  limit = 50, 
  offset = 0
): Promise<ExerciseFull[]> => {
  try {
    console.log(`Fetching exercises with limit ${limit} and offset ${offset}`);
    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('name');
    
    if (error) {
      console.error('Error fetching exercises_full data:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} exercises from exercises_full`);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch exercises_full:', error);
    throw error;
  }
};
