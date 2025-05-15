
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFull } from '@/types/exercise';

export type ExerciseDetailService = {
  fetchExerciseById: (id: string | number) => Promise<ExerciseFull | null>;
  updateExercise: (id: string | number, exerciseData: Partial<ExerciseFull>) => Promise<ExerciseFull | null>;
};

// Export this function directly for component use
export const getExerciseFullById = async (id: string | number): Promise<ExerciseFull | null> => {
  try {
    // Convert ID to string to ensure compatibility
    const exerciseId = id.toString();
    
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
    
    // Return the exercise data
    return exerciseData as ExerciseFull;
    
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
      const { data, error } = await supabase
        .from('exercises_full')
        .update({
          ...exerciseData,
          // Handle specific fields if needed
          primary_equipment: exerciseData.primary_equipment || undefined,
        })
        .eq('id', id.toString())
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
