
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { mapExerciseFullToExercise } from "../mappers";

// Modified interface to fix the type incompatibility with instructions
interface ExerciseFullData extends Omit<ExerciseFull, 'instructions'> {
  image_url?: string;
  description?: string;
  instructions?: string[] | string;
}

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
    
    // Create the exercise full object with proper type safety
    const exerciseData: ExerciseFullData = {
      ...data,
      id: String(data.id), // Convert ID to string here
      name: data.name || '',
    };
    
    // Add optional fields with proper typing
    if ('description' in data) exerciseData.description = String(data.description || '');
    
    // Handle instructions properly, ensuring it's always an array
    if ('instructions' in data) {
      if (Array.isArray(data.instructions)) {
        exerciseData.instructions = data.instructions;
      } else if (data.instructions) {
        exerciseData.instructions = [String(data.instructions)];
      } else {
        exerciseData.instructions = [];
      }
    }
    
    // Handle image_url safely
    if ('image_url' in data) exerciseData.image_url = String(data.image_url || '');
    
    // Set thumbnail URL with fallback
    if ('youtube_thumbnail_url' in data) {
      exerciseData.image_url = String(exerciseData.image_url || data.youtube_thumbnail_url || '');
    }
    
    if ('target_muscle_group' in data) {
      exerciseData.target_muscle_group = String(data.target_muscle_group || data.prime_mover_muscle || '');
    }

    // Cast the data to ExerciseFull, ensuring instructions is an array
    const result: ExerciseFull = {
      ...exerciseData,
      instructions: Array.isArray(exerciseData.instructions) ? 
        exerciseData.instructions : 
        exerciseData.instructions ? [String(exerciseData.instructions)] : []
    };

    return result;
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
    
    // Use the proper approach for Supabase's typing
    const { data, error } = await supabase
      .from('exercises_full')
      .update(updateData as any) // Cast to any to bypass TypeScript check
      .eq('id', exerciseId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Ensure ID is converted to string in the result
    if (data) {
      return { ...data, id: String(data.id) } as ExerciseFull;
    }
    
    return null;
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
    // Use the proper approach for Supabase's typing
    const { data, error } = await supabase
      .from('exercises_full')
      .insert(exercise as any) // Cast to any to bypass TypeScript check
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Ensure ID is converted to string in the result
    if (data) {
      return { ...data, id: String(data.id) } as ExerciseFull;
    }
    
    return null;
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
