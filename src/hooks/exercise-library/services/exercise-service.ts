
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { defaultMuscleGroups, defaultEquipmentTypes } from "@/hooks/exercise-library/constants";
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

export const getMuscleGroups = async (): Promise<string[]> => {
  if (exerciseCache.muscleGroups) {
    return exerciseCache.muscleGroups;
  }
  
  exerciseCache.muscleGroups = defaultMuscleGroups;
  return defaultMuscleGroups;
};

export const getEquipmentTypes = async (): Promise<string[]> => {
  if (exerciseCache.equipmentTypes) {
    return exerciseCache.equipmentTypes;
  }
  
  exerciseCache.equipmentTypes = defaultEquipmentTypes;
  return defaultEquipmentTypes;
};
