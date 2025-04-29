
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const fetchExercisesFull = async (
  limit = 50, 
  offset = 0
): Promise<ExerciseFull[]> => {
  try {
    console.log(`Fetching exercises with limit ${limit} and offset ${offset}`);
    
    // Add more debugging to see what's happening with the query
    const response = await supabase
      .from('exercises_full')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('name');
    
    if (response.error) {
      console.error('Error fetching exercises_full data:', response.error);
      throw response.error;
    }
    
    const { data } = response;
    
    console.log(`Fetched ${data?.length || 0} exercises from exercises_full`);
    if (data?.length === 0) {
      console.log('No data returned from exercises_full table. Please check if the table exists and has data.');
      // Log the first few results or error details
      console.log('Response:', JSON.stringify(response, null, 2));
    }
    
    // Transform the data to match our ExerciseFull type
    const transformedData: ExerciseFull[] = (data || []).map(item => ({
      ...item,
      // Add the missing properties with default null values
      video_demonstration_url: item.short_youtube_demo || null,
      video_explanation_url: item.in_depth_youtube_exp || null
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Failed to fetch exercises_full:', error);
    throw error;
  }
};
