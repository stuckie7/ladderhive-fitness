
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { mapExerciseFullToExercise } from "../mappers";

/**
 * Fetches an exercise by its ID
 * @param id The exercise ID
 * @returns The exercise data
 */
export const getExerciseFullById = async (id: string | number): Promise<ExerciseFull | null> => {
  try {
    // Handle both string and number IDs
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    console.log(`Fetching exercise with ID: ${numericId}`);

    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', numericId)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }

    if (!data) {
      console.warn(`No exercise found with ID: ${numericId}`);
      return null;
    }

    console.log('Exercise data:', data);
    
    // Add fields that might be expected but are missing from the database
    const exerciseData: ExerciseFull = {
      ...data,
      // Add any missing fields with fallbacks
      description: data.description || '',
      instructions: data.instructions || [],
      image_url: data.image_url || data.youtube_thumbnail_url || '',
      target_muscle_group: data.target_muscle_group || data.prime_mover_muscle || '',
    };

    return exerciseData;
  } catch (error) {
    console.error('Error in getExerciseFullById:', error);
    throw error;
  }
};

/**
 * Fetches an exercise by its ID and maps it to the Exercise type
 */
export const getExerciseById = async (id: string | number): Promise<Exercise | null> => {
  const exerciseFull = await getExerciseFullById(id);
  if (!exerciseFull) return null;
  
  return mapExerciseFullToExercise(exerciseFull);
};

/**
 * Updates an exercise in the database
 */
export const updateExerciseInDatabase = async (exercise: Partial<ExerciseFull>): Promise<ExerciseFull | null> => {
  if (!exercise.id) {
    throw new Error('Exercise ID is required for updating');
  }

  // Handle ID type correctly for the database
  const exerciseId = typeof exercise.id === 'string' ? parseInt(exercise.id, 10) : exercise.id;

  try {
    // Filter out the id field as it's used in the where clause
    const { id, ...updateData } = exercise;
    
    const { data, error } = await supabase
      .from('exercises_full')
      .update(updateData)
      .eq('id', exerciseId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data as ExerciseFull;
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error;
  }
};

/**
 * Creates a new exercise in the database
 */
export const createExerciseInDatabase = async (exercise: Partial<ExerciseFull>): Promise<ExerciseFull | null> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .insert(exercise)
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data as ExerciseFull;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

/**
 * Deletes an exercise from the database
 */
export const deleteExerciseFromDatabase = async (id: string | number): Promise<void> => {
  // Handle ID type correctly for the database
  const exerciseId = typeof id === 'string' ? parseInt(id, 10) : id;

  try {
    const { error } = await supabase
      .from('exercises_full')
      .delete()
      .eq('id', exerciseId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
};
