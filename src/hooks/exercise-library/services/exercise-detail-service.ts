
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFull } from '@/types/exercise';

export type ExerciseDetailService = {
  fetchExerciseById: (id: string | number) => Promise<ExerciseFull | null>;
  updateExercise: (id: string | number, exerciseData: Partial<ExerciseFull>) => Promise<ExerciseFull | null>;
};

// Utility function to ensure numeric ID
const ensureNumericId = (id: string | number): number => {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
};

// Export this function directly for component use
export const getExerciseFullById = async (id: string | number): Promise<ExerciseFull | null> => {
  try {
    // Convert ID to number for database query
    const exerciseId = ensureNumericId(id);
    
    // Fetch the exercise details
    const { data: exerciseData, error } = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', exerciseId)
      .single();
    
    if (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }

    if (!exerciseData) {
      console.warn('Exercise not found:', exerciseId);
      return null;
    }
    
    // Ensure description and instructions fields are available
    const enhancedExerciseData: ExerciseFull = {
      ...exerciseData,
      description: exerciseData.description || '',
      instructions: exerciseData.instructions ? 
        Array.isArray(exerciseData.instructions) ? 
          exerciseData.instructions : 
          [exerciseData.instructions] 
        : [],
      video_url: exerciseData.short_youtube_demo || exerciseData.video_demonstration_url,
    };
    
    // Return the exercise data
    return enhancedExerciseData;
    
  } catch (error) {
    console.error('Unexpected error in getExerciseFullById:', error);
    return null;
  }
};

export const createExerciseDetailService = (): ExerciseDetailService => {
  const fetchExerciseById = async (id: string | number): Promise<ExerciseFull | null> => {
    return getExerciseFullById(id);
  };
  
  const updateExercise = async (id: string | number, exerciseData: Partial<ExerciseFull>): Promise<ExerciseFull | null> => {
    try {
      // Convert the exerciseData to a simple object without any complex types
      const updatePayload: any = {
        ...exerciseData,
        // Handle specific fields if needed
        primary_equipment: exerciseData.primary_equipment || undefined,
      };
      
      // Remove any properties that shouldn't be sent to Supabase
      if (updatePayload.instructions && Array.isArray(updatePayload.instructions)) {
        updatePayload.instructions = updatePayload.instructions.join('\n');
      }
      
      // Convert ID to number for database query
      const exerciseId = ensureNumericId(id);
      
      const { data, error } = await supabase
        .from('exercises_full')
        .update(updatePayload)
        .eq('id', exerciseId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating exercise:', error);
        return null;
      }
      
      return data as ExerciseFull;
    } catch (error) {
      console.error('Unexpected error in updateExercise:', error);
      return null;
    }
  };
  
  return {
    fetchExerciseById,
    updateExercise,
  };
};

export default createExerciseDetailService;
