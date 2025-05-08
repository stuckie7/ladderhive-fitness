import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { checkExercisesFullTableExists } from "./exercise-fetch-service";

const getBestVideoUrl = (exercise: ExerciseFull): string | null => {
  return exercise.short_youtube_demo || exercise.in_depth_youtube_exp || null;
};

/**
 * Helper function to deduplicate exercises with a preference for those with video links
 */
export const deduplicateExercises = (data: ExerciseFull[]): ExerciseFull[] => {
  const uniqueMap = new Map<string, ExerciseFull>();
  
  data.forEach(item => {
    const name = item.name?.toLowerCase().trim() || '';
    if (!name) return;
    
    const existingItem = uniqueMap.get(name);
    const currentHasVideo = Boolean(getBestVideoUrl(item));
    const existingHasVideo = existingItem ? Boolean(getBestVideoUrl(existingItem)) : false;
    
    if (!existingItem || 
        (currentHasVideo && !existingHasVideo) ||
        (currentHasVideo && existingHasVideo && 
         (item.in_depth_youtube_exp && !existingItem.in_depth_youtube_exp))) {
      uniqueMap.set(name, {
        ...item,
        video_demonstration_url: getBestVideoUrl(item),
        video_explanation_url: item.in_depth_youtube_exp || null
      });
    }
  });
  
  return Array.from(uniqueMap.values());
};

/**
 * Loads exercise data with filters applied
 */
export const loadExerciseData = async (
  selectedMuscleGroup: string,
  selectedEquipment: string,
  selectedDifficulty: string,
  searchQuery: string,
  currentPage: number,
  itemsPerPage: number
): Promise<ExerciseFull[]> => {
  const exists = await checkExercisesFullTableExists();
  if (!exists) {
    throw new Error("The exercises_full table does not exist in your database.");
  }
  
  let query = supabase.from('exercises_full').select('*');
  
  if (selectedMuscleGroup !== 'all') {
    query = query.eq('prime_mover_muscle', selectedMuscleGroup);
  }
  
  if (selectedEquipment !== 'all') {
    query = query.eq('primary_equipment', selectedEquipment);
  }
  
  if (selectedDifficulty !== 'all') {
    query = query.eq('difficulty', selectedDifficulty);
  }
  
  if (searchQuery.trim()) {
    query = query.ilike('name', `%${searchQuery}%`);
  }
  
  const { data, error } = await query
    .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  if (data) {
    const uniqueData = deduplicateExercises(data as ExerciseFull[]);
    
    return uniqueData.map(item => ({
      ...item,
      target_muscle_group: item.prime_mover_muscle,
      video_demonstration_url: getBestVideoUrl(item),
      video_explanation_url: item.in_depth_youtube_exp || null
    }));
  }
  
  return [];
};

/**
 * Gets the total count of exercises with filters applied
 */
export const getExercisesCount = async (
  selectedMuscleGroup: string,
  selectedEquipment: string,
  selectedDifficulty: string,
  searchQuery: string
) => {
  let countQuery = supabase.from('exercises_full').select('*', { count: 'exact', head: true });
  
  if (selectedMuscleGroup !== 'all') {
    countQuery = countQuery.eq('prime_mover_muscle', selectedMuscleGroup);
  }
  
  if (selectedEquipment !== 'all') {
    countQuery = countQuery.eq('primary_equipment', selectedEquipment);
  }
  
  if (selectedDifficulty !== 'all') {
    countQuery = countQuery.eq('difficulty', selectedDifficulty);
  }
  
  if (searchQuery.trim()) {
    countQuery = countQuery.ilike('name', `%${searchQuery}%`);
  }
  
  const countResponse = await countQuery;
  return countResponse.count || 0;
};

/**
 * Loads filter options (muscle groups, equipment types, difficulty levels)
 */
export const loadFilterOptions = async () => {
  try {
    const muscleGroupsResponse = await supabase
      .from('exercises_full')
      .select('prime_mover_muscle')
      .not('prime_mover_muscle', 'is', null);
      
    const equipmentResponse = await supabase
      .from('exercises_full')
      .select('primary_equipment')
      .not('primary_equipment', 'is', null);
      
    const difficultyResponse = await supabase
      .from('exercises_full')
      .select('difficulty')
      .not('difficulty', 'is', null);
      
    return {
      muscleGroups: muscleGroupsResponse.data
        ? Array.from(new Set(
            muscleGroupsResponse.data
              .map(item => item.prime_mover_muscle)
              .filter(Boolean)
          )).sort()
        : [],
      equipmentTypes: equipmentResponse.data
        ? Array.from(new Set(
            equipmentResponse.data
              .map(item => item.primary_equipment)
              .filter(Boolean)
          )).sort()
        : [],
      difficultyLevels: difficultyResponse.data
        ? Array.from(new Set(
            difficultyResponse.data
              .map(item => item.difficulty)
              .filter(Boolean)
          )).sort()
        : []
    };
  } catch (error) {
    console.error("Failed to load filter options:", error);
    return {
      muscleGroups: [],
      equipmentTypes: [],
      difficultyLevels: []
    };
  }
};
