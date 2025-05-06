
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
      // Map properties correctly
      target_muscle_group: item.prime_mover_muscle || null,
      video_demonstration_url: item.short_youtube_demo || null,
      video_explanation_url: item.in_depth_youtube_exp || null
    })) as ExerciseFull[];
    
    return transformedData;
  } catch (error) {
    console.error('Failed to fetch exercises_full:', error);
    throw error;
  }
};

// Enhanced utility function to check if the table exists and get its column info
export const checkExercisesFullTableExists = async (): Promise<boolean> => {
  try {
    // Try to get a single row to check if the table exists
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

// New function to get column names of exercises_full table
export const getExercisesFullColumns = async (): Promise<string[]> => {
  try {
    // Try to get column names using a direct approach
    // This query will return the first row, which should have all column names as keys
    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error getting columns from exercises_full:', error);
      return [];
    }
    
    // If we have data, return the column names
    if (data) {
      return Object.keys(data);
    }
    
    // If no data, try a different approach to get just the structure
    const { data: countData, error: countError } = await supabase
      .from('exercises_full')
      .select('count(*)');
      
    if (countError) {
      console.error('Error getting count from exercises_full:', countError);
      return [];
    }
    
    // If we got a successful response but no data, 
    // the table exists but is empty. Return default columns.
    return ['id', 'name', 'prime_mover_muscle', 'primary_equipment', 'difficulty', 'short_youtube_demo'];
  } catch (error) {
    console.error('Failed to get column names:', error);
    return [];
  }
};

// New function to search exercises with all the filtering capabilities
export const searchExercisesFull = async (
  searchQuery = '',
  limit = 20
): Promise<ExerciseFull[]> => {
  try {
    console.log(`Searching exercises with term "${searchQuery}"`);
    
    let query = supabase
      .from('exercises_full')
      .select('*');
    
    // Apply search query if provided
    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,prime_mover_muscle.ilike.%${searchQuery}%,primary_equipment.ilike.%${searchQuery}%`);
    }
    
    // Add pagination and order
    query = query.limit(limit).order('name');
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching exercises_full:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} exercises matching search criteria`);
    
    // Transform the data to match our ExerciseFull type
    const transformedData: ExerciseFull[] = (data || []).map(item => ({
      ...item,
      // Map properties correctly
      target_muscle_group: item.prime_mover_muscle || null,
      video_demonstration_url: item.short_youtube_demo || null,
      video_explanation_url: item.in_depth_youtube_exp || null
    })) as ExerciseFull[];
    
    return transformedData;
  } catch (error) {
    console.error('Failed to search exercises_full:', error);
    throw error;
  }
};

// Get exercise by id
export const getExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching exercise by id:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Transform the data to match our ExerciseFull type
    const transformedData: ExerciseFull = {
      ...data,
      // Map properties correctly
      target_muscle_group: data.prime_mover_muscle || null,
      video_demonstration_url: data.short_youtube_demo || null,
      video_explanation_url: data.in_depth_youtube_exp || null
    } as ExerciseFull;
    
    return transformedData;
  } catch (error) {
    console.error('Failed to fetch exercise by id:', error);
    throw error;
  }
};

// Get all muscle groups
export const getMuscleGroups = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .select('prime_mover_muscle')
      .not('prime_mover_muscle', 'is', null);
      
    if (error) {
      throw error;
    }
    
    // Extract unique muscle groups
    const muscleGroups = [...new Set(data.map(item => item.prime_mover_muscle))].filter(
      (group): group is string => typeof group === 'string'
    ).sort();
    
    return muscleGroups;
  } catch (error) {
    console.error('Failed to fetch muscle groups:', error);
    return [];
  }
};

// Get all equipment types
export const getEquipmentTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .select('primary_equipment')
      .not('primary_equipment', 'is', null);
      
    if (error) {
      throw error;
    }
    
    // Extract unique equipment types
    const equipmentTypes = [...new Set(data.map(item => item.primary_equipment))].filter(
      (type): type is string => typeof type === 'string'
    ).sort();
    
    return equipmentTypes;
  } catch (error) {
    console.error('Failed to fetch equipment types:', error);
    return [];
  }
};
