
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { checkExercisesFullTableExists } from "./exercise-fetch-service";

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
) => {
  // Check if the table exists first
  const exists = await checkExercisesFullTableExists();
  if (!exists) {
    throw new Error("The exercises_full table does not exist in your database.");
  }
  
  // Build the query
  let query = supabase.from('exercises_full').select('*');
  
  // Apply filters
  if (selectedMuscleGroup !== 'all') {
    query = query.eq('prime_mover_muscle', selectedMuscleGroup);
  }
  
  if (selectedEquipment !== 'all') {
    query = query.eq('primary_equipment', selectedEquipment);
  }
  
  if (selectedDifficulty !== 'all') {
    query = query.eq('difficulty', selectedDifficulty);
  }
  
  // Apply search if provided
  if (searchQuery.trim()) {
    query = query.ilike('name', `%${searchQuery}%`);
  }
  
  // Apply pagination
  const { data, error } = await query
    .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  console.log("Fetched exercises:", data);
  
  // Deduplicate and transform the data
  if (data) {
    // Deduplicate by name with video priority
    const uniqueMap = new Map<string, ExerciseFull>();
    
    data.forEach(item => {
      const name = item.name?.toLowerCase().trim() || '';
      const existingItem = uniqueMap.get(name);
      const hasVideo = Boolean(item.short_youtube_demo);
      
      if (!existingItem || (hasVideo && !existingItem.short_youtube_demo)) {
        uniqueMap.set(name, item as ExerciseFull);
      }
    });
    
    const uniqueData = Array.from(uniqueMap.values());
    
    // Map to ensure all required fields exist
    const mappedData: ExerciseFull[] = uniqueData.map(item => ({
      ...item,
      // Add the required fields that might be missing
      target_muscle_group: item.prime_mover_muscle,
      video_demonstration_url: item.short_youtube_demo,
      video_explanation_url: item.in_depth_youtube_exp
    }));
    
    return mappedData;
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
  
  // Apply the same filters to the count query
  if (selectedMuscleGroup !== 'all') {
    countQuery = countQuery.eq('prime_mover_muscle', selectedMuscleGroup);
  }
  
  if (selectedEquipment !== 'all') {
    countQuery = countQuery.eq('primary_equipment', selectedEquipment);
  }
  
  if (selectedDifficulty !== 'all') {
    countQuery = countQuery.eq('difficulty', selectedDifficulty);
  }
  
  // Apply search to count if provided
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
    // Get unique muscle groups
    const muscleGroupsResponse = await supabase
      .from('exercises_full')
      .select('prime_mover_muscle')
      .not('prime_mover_muscle', 'is', null);
      
    let muscleGroups: string[] = [];
    if (muscleGroupsResponse.data) {
      muscleGroups = Array.from(new Set(
        muscleGroupsResponse.data
          .map(item => item.prime_mover_muscle)
          .filter(Boolean)
      )).sort();
    }
    
    // Get unique equipment types
    const equipmentResponse = await supabase
      .from('exercises_full')
      .select('primary_equipment')
      .not('primary_equipment', 'is', null);
      
    let equipmentTypes: string[] = [];
    if (equipmentResponse.data) {
      equipmentTypes = Array.from(new Set(
        equipmentResponse.data
          .map(item => item.primary_equipment)
          .filter(Boolean)
      )).sort();
    }
    
    // Get unique difficulty levels
    const difficultyResponse = await supabase
      .from('exercises_full')
      .select('difficulty')
      .not('difficulty', 'is', null);
      
    let difficultyLevels: string[] = [];
    if (difficultyResponse.data) {
      difficultyLevels = Array.from(new Set(
        difficultyResponse.data
          .map(item => item.difficulty)
          .filter(Boolean)
      )).sort();
    }
    
    return {
      muscleGroups,
      equipmentTypes,
      difficultyLevels
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
