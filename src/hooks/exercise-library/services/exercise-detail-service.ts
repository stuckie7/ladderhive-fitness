
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
    
    // Ensure the returned data has correct typing
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
    
    // Create an update object with only the fields that exist in the exercises_full table
    const updateData = {
      ...exercise,
      id: numericId,
      description: exercise.description || null,
      instructions: Array.isArray(exercise.instructions) ? exercise.instructions : null
    };
    
    // Handle instructions formatting if needed
    const { data, error } = await supabase
      .from('exercises_full')
      .update(updateData)
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
    // Create an insert object with only allowed fields
    const insertData: Partial<ExerciseFull> = {
      name: exercise.name || 'New Exercise',
      difficulty: exercise.difficulty || 'Beginner',
      prime_mover_muscle: exercise.prime_mover_muscle || 'Other',
      primary_equipment: exercise.primary_equipment || 'Bodyweight',
      body_region: exercise.body_region || 'Full Body',
      // Include only fields that are in the table schema
      short_youtube_demo: exercise.short_youtube_demo,
      description: exercise.description,
      image_url: exercise.image_url,
    };
    
    const { data, error } = await supabase
      .from('exercises_full')
      .insert(insertData)
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
