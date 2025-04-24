
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { exerciseCache, isCacheValid, getCachedExercises, setCachedExercises } from "../cache/exercise-cache";

export const getExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
  const cacheKey = `exercise_${id}`;
  
  if (isCacheValid(cacheKey)) {
    return getCachedExercises(cacheKey)[0] || null;
  }
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }
  
  const exercise = data as ExerciseFull;
  setCachedExercises(cacheKey, [exercise]);
  
  return exercise;
};
