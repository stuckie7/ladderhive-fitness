import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { checkExercisesFullTableExists } from "./exercise-fetch-service";

const getBestVideoUrl = (exercise: any): string | null => {
  return exercise.short_youtube_demo || exercise.in_depth_youtube_exp || null;
};

/**
 * Helper function to deduplicate exercises with a preference for those with video links
 */
export const deduplicateExercises = (data: any[]): ExerciseFull[] => {
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
      
      // Map the data to match ExerciseFull type
      const mappedItem: ExerciseFull = {
        ...item,
        video_demonstration_url: getBestVideoUrl(item),
        video_explanation_url: item.in_depth_youtube_exp || null,
        target_muscle_group: item.prime_mover_muscle || null
      } as ExerciseFull;
      
      uniqueMap.set(name, mappedItem);
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
  
  if (!data) return [];
  
  return deduplicateExercises(data);
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

/**
 * Creates a new exercise in the database
 */
export const createExercise = async (exerciseData: Partial<ExerciseFull>): Promise<ExerciseFull> => {
  try {
    // Prepare the exercise data by removing any id field (database will generate one)
    const { id, ...dataToInsert } = exerciseData;
    
    // Make sure required fields are included
    if (!dataToInsert.name) {
      throw new Error('Exercise name is required');
    }
    
    // Handle instructions - ensure it's stored as an array in the database
    if (typeof dataToInsert.instructions === 'string') {
      dataToInsert.instructions = (dataToInsert.instructions as string).split('\n');
    }
    
    // Insert the new exercise
    const { data, error } = await supabase
      .from('exercises_full')
      .insert(dataToInsert as any)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as ExerciseFull;
  } catch (error) {
    console.error("Error creating exercise:", error);
    throw error;
  }
};

/**
 * Updates an existing exercise in the database
 */
export const updateExercise = async (exerciseData: Partial<ExerciseFull>): Promise<ExerciseFull> => {
  try {
    if (!exerciseData.id) {
      throw new Error('Exercise ID is required for updating');
    }
    
    // Convert string id to number if needed
    const id = typeof exerciseData.id === 'string' ? parseInt(exerciseData.id, 10) : exerciseData.id;
    const { id: _, ...dataToUpdate } = exerciseData;
    
    // Handle instructions - ensure it's stored as an array in the database
    if (typeof dataToUpdate.instructions === 'string') {
      dataToUpdate.instructions = (dataToUpdate.instructions as string).split('\n');
    }
    
    // Update the exercise
    const { data, error } = await supabase
      .from('exercises_full')
      .update(dataToUpdate as any)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as ExerciseFull;
  } catch (error) {
    console.error("Error updating exercise:", error);
    throw error;
  }
};

/**
 * Deletes an exercise from the database
 */
export const deleteExercise = async (id: string | number): Promise<void> => {
  try {
    // Convert string id to number if needed
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const { error } = await supabase
      .from('exercises_full')
      .delete()
      .eq('id', numericId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
};
