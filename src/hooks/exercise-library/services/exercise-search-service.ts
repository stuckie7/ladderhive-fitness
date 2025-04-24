
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { exerciseCache, isCacheValid, getCachedExercises, setCachedExercises } from "../cache/exercise-cache";

export const searchExercisesFull = async (searchTerm: string, limit = 20): Promise<ExerciseFull[]> => {
  const cacheKey = `search_${searchTerm}_${limit}`;
  
  if (isCacheValid(cacheKey)) {
    return getCachedExercises(cacheKey);
  }
  
  console.log('Searching exercises_full for:', searchTerm);
  
  const { data, error } = await supabase
    .from('exercises_full')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .limit(limit);
  
  if (error) {
    throw error;
  }
  
  const exercises = data as ExerciseFull[];
  setCachedExercises(cacheKey, exercises);
  
  console.log(`Found ${exercises?.length || 0} matching exercises for search "${searchTerm}"`);
  return exercises;
};
