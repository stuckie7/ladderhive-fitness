
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const searchExercisesFull = async (
  searchTerm: string,
  limit = 20
): Promise<ExerciseFull[]> => {
  try {
    console.log(`Searching exercises with term "${searchTerm}" and limit ${limit}`);
    
    // Build the search query using ILIKE for case-insensitive matching
    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .or(`name.ilike.%${searchTerm}%, target_muscle_group.ilike.%${searchTerm}%, primary_equipment.ilike.%${searchTerm}%`)
      .limit(limit);
    
    if (error) {
      console.error('Error searching exercises_full:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} exercises matching search term "${searchTerm}"`);
    return data || [];
  } catch (error) {
    console.error('Failed to search exercises_full:', error);
    throw error;
  }
};
