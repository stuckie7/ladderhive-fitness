
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
    
    const { data, count } = response;
    
    console.log(`Fetched ${data?.length || 0} exercises from exercises_full (total count: ${count || 'unknown'})`);
    
    if (data?.length === 0) {
      console.log('No data returned from exercises_full table. Please check if the table exists and has data.');
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

// Add a utility function to check if the table exists
export const checkExercisesFullTableExists = async (): Promise<boolean> => {
  try {
    // Instead of querying information_schema, we'll try to get a single row
    // If the table doesn't exist, we'll get an error
    const { data, error } = await supabase
      .from('exercises_full')
      .select('id')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01') { // PostgreSQL error code for undefined_table
        console.error('Table exercises_full does not exist:', error);
        return false;
      }
      console.error('Error checking if exercises_full table exists:', error);
      return false;
    }
    
    // If we get here, the table exists (even if empty)
    return true;
  } catch (error) {
    console.error('Failed to check if exercises_full table exists:', error);
    return false;
  }
};
