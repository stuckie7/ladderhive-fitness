
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { exerciseCache, isCacheValid, getCachedExercises, setCachedExercises } from "../cache/exercise-cache";

export const fetchExercisesFull = async (limit = 50, offset = 0): Promise<ExerciseFull[]> => {
  const cacheKey = `exercises_${limit}_${offset}`;
  
  if (isCacheValid(cacheKey)) {
    return getCachedExercises(cacheKey);
  }
  
  console.log('Fetching exercises_full with limit:', limit, 'offset:', offset);
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }
  
  const exercises = data as ExerciseFull[];
  setCachedExercises(cacheKey, exercises);
  
  console.log(`Fetched ${exercises?.length || 0} exercises from exercises_full table`);
  return exercises;
};
