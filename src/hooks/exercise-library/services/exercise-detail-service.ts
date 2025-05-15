
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFull } from '@/types/exercise';

/**
 * Fetches an exercise by ID from the exercises_full table
 * @param id - The exercise ID
 */
export const getExerciseFullById = async (id: string | number): Promise<ExerciseFull | null> => {
  try {
    // Convert id to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', numericId)
      .single();
    
    if (error) {
      console.error('Error fetching exercise full data:', error);
      return null;
    }
    
    return data as ExerciseFull;
  } catch (error) {
    console.error('Exception fetching exercise full data:', error);
    return null;
  }
};

/**
 * Updates an exercise in the exercises_full table
 * @param exercise - The exercise data to update
 */
export const updateExerciseFull = async (exercise: Partial<ExerciseFull>): Promise<ExerciseFull | null> => {
  try {
    // Ensure we have a numeric ID
    const numericId = typeof exercise.id === 'string' ? parseInt(exercise.id, 10) : exercise.id;
    
    const { data, error } = await supabase
      .from('exercises_full')
      .update({
        ...exercise,
        // Ensure these properties exist or default to empty values
        description: exercise.description || '',
        instructions: exercise.instructions || [],
        // Add other required fields that might be missing
        video_demonstration_url: exercise.video_demonstration_url || exercise.short_youtube_demo || ''
      })
      .eq('id', numericId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating exercise full data:', error);
      return null;
    }
    
    return data as ExerciseFull;
  } catch (error) {
    console.error('Exception updating exercise full data:', error);
    return null;
  }
};

/**
 * Creates an exercise in the exercises_full table
 * @param exercise - The exercise data to create
 */
export const createExerciseFull = async (exercise: Partial<ExerciseFull>): Promise<ExerciseFull | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .insert({
        name: exercise.name || 'New Exercise',
        description: exercise.description || '',
        prime_mover_muscle: exercise.prime_mover_muscle || 'Other',
        primary_equipment: exercise.primary_equipment || 'Bodyweight',
        difficulty: exercise.difficulty || 'Beginner',
        body_region: exercise.body_region || 'Full Body',
        // Default values for required fields
        ...exercise
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating exercise full data:', error);
      return null;
    }
    
    return data as ExerciseFull;
  } catch (error) {
    console.error('Exception creating exercise full data:', error);
    return null;
  }
};

/**
 * Deletes an exercise from the exercises_full table
 * @param id - The exercise ID
 */
export const deleteExerciseFull = async (id: string | number): Promise<boolean> => {
  try {
    // Convert id to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const { error } = await supabase
      .from('exercises_full')
      .delete()
      .eq('id', numericId);
    
    if (error) {
      console.error('Error deleting exercise full data:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deleting exercise full data:', error);
    return false;
  }
};
