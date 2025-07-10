
import { supabase } from "@/lib/supabase";
import { 
  fetchWgerExercises, 
  fetchWgerCategories, 
  fetchWgerEquipment, 
  fetchWgerMuscles,
  transformWgerExercise,
  WgerExercise,
  WgerCategory,
  WgerEquipment,
  WgerMuscle
} from "@/utils/wgerDataFetcher";

/**
 * Imports exercises from the wger repository to our database
 */
export const importWgerExercises = async (
  onProgress?: (message: string, progress: number) => void
) => {
  try {
    onProgress?.('Fetching categories from wger...', 0);
    const categories = await fetchWgerCategories();
    
    onProgress?.('Fetching muscles from wger...', 20);
    const muscles = await fetchWgerMuscles();
    
    onProgress?.('Fetching equipment from wger...', 40);
    const equipment = await fetchWgerEquipment();
    
    onProgress?.('Fetching exercises from wger...', 60);
    const exercises = await fetchWgerExercises();
    
    onProgress?.(`Found ${exercises.length} exercises in wger repository`, 70);
    
    // Transform exercises to our format
    const transformedExercises = exercises.map(ex => 
      transformWgerExercise(ex, categories, muscles, equipment)
    );
    
    onProgress?.(`Importing ${transformedExercises.length} exercises to database...`, 80);
    
    // Insert exercises into our database
    const { data, error } = await supabase
      .from('exercises')
      .upsert(transformedExercises, { onConflict: 'id' });
      
    if (error) throw error;
    
    onProgress?.('Exercise import completed successfully', 100);
    return transformedExercises;
  } catch (error) {
    console.error('Error importing exercises from wger:', error);
    throw error;
  }
};

/**
 * Previews exercises from the wger repository without importing them
 */
export const previewWgerExercises = async () => {
  try {
    const [categories, muscles, equipment, exercises] = await Promise.all([
      fetchWgerCategories(),
      fetchWgerMuscles(),
      fetchWgerEquipment(),
      fetchWgerExercises()
    ]);
    
    // Just transform a sample for preview
    const sampleExercises = exercises.slice(0, 10).map(ex => 
      transformWgerExercise(ex, categories, muscles, equipment)
    );
    
    return {
      totalCount: exercises.length,
      sample: sampleExercises
    };
  } catch (error) {
    console.error('Error previewing wger exercises:', error);
    throw error;
  }
};

/**
 * Imports categories from the wger repository
 */
export const importWgerCategories = async () => {
  try {
    const categories = await fetchWgerCategories();
    
    // Transform categories into our format with required fields
    const mappedCategories = categories.map(category => ({
      id: category.pk.toString(),
      name: category.fields.name,
      category: 'Exercise', // Adding the required category field
      created_at: new Date().toISOString()
    }));
    
    // Insert categories into database
    const { data, error } = await supabase
      .from('equipment') // This should probably be 'categories' instead of 'equipment'
      .upsert(mappedCategories, { onConflict: 'id' });
      
    if (error) throw error;
    
    return mappedCategories;
  } catch (error) {
    console.error('Error importing categories from wger:', error);
    throw error;
  }
};
