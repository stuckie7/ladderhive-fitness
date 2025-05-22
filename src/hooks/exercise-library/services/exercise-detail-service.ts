
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

    // First try to fetch from exercises_full
    let response = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', numericId)
      .single();

    // If not found in exercises_full, try exercises table
    if (!response.data || response.error) {
      console.log('Exercise not found in exercises_full, trying exercises table...');
      response = await supabase
        .from('exercises')
        .select('*')
        .eq('id', numericId)
        .single();
    }

    if (response.error) {
      console.error('Error fetching exercise:', response.error);
      throw response.error;
    }

    if (!response.data) {
      console.warn(`No exercise found with ID: ${numericId}`);
      return null;
    }

    console.log('Exercise data:', response.data);
    
    // Map the data to ExerciseFull type
    const data = response.data;
    const exerciseData: ExerciseFull = {
      id: String(data.id),
      name: data.name || 'Unnamed Exercise',
      description: data.description || '',
      instructions: data.instructions,
      video_url: data.video_url || data.video_demonstration_url,
      image_url: data.image_url || data.youtube_thumbnail_url,
      body_region: data.body_region || data.bodyPart,
      mechanics: data.mechanics,
      force_type: data.force_type,
      posture: data.posture,
      laterality: data.laterality,
      arm_movement_pattern: data.arm_movement_pattern,
      foot_elevation: data.foot_elevation,
      combination_exercise: data.combination_exercise,
      difficulty: data.difficulty || data.difficulty_level,
      exercise_classification: data.exercise_classification,
      target_muscle_group: data.target_muscle_group || data.target || data.prime_mover_muscle,
      prime_mover_muscle: data.prime_mover_muscle,
      secondary_muscle: data.secondary_muscle,
      tertiary_muscle: data.tertiary_muscle,
      primary_equipment: data.primary_equipment || data.equipment,
      secondary_equipment: data.secondary_equipment,
      video_demonstration_url: data.video_demonstration_url,
      video_explanation_url: data.video_explanation_url,
      youtube_thumbnail_url: data.youtube_thumbnail_url,
      short_youtube_demo: data.short_youtube_demo,
      in_depth_youtube_exp: data.in_depth_youtube_exp,
      single_or_double_arm: data.single_or_double_arm,
      grip: data.grip,
      load_position: data.load_position,
      leg_movement_pattern: data.leg_movement_pattern,
      movement_pattern_1: data.movement_pattern_1,
      movement_pattern_2: data.movement_pattern_2,
      movement_pattern_3: data.movement_pattern_3,
      plane_of_motion_1: data.plane_of_motion_1,
      plane_of_motion_2: data.plane_of_motion_2,
      plane_of_motion_3: data.plane_of_motion_3,
      equipment: data.equipment,
      bodyPart: data.bodyPart,
      target: data.target,
      equipment_needed: data.equipment_needed,
      secondaryMuscles: data.secondaryMuscles || (data.secondary_muscle ? [data.secondary_muscle] : []),
      muscle_group: data.muscle_group,
      muscle_groups: data.muscle_groups || (data.target_muscle_group ? [data.target_muscle_group] : []),
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
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
