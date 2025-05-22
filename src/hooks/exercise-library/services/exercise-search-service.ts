
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';
import { normalizeExerciseId } from '../mappers';

const getBestVideoUrl = (exercise: any): string | null => {
  return exercise.short_youtube_demo || exercise.in_depth_youtube_exp || null;
};

export const searchExercisesFull = async (
  searchTerm: string,
  limit = 20
): Promise<ExerciseFull[]> => {
  try {
    console.log(`Searching exercises with term "${searchTerm}" and limit ${limit}`);

    const { data, error } = await supabase
      .from('exercises_full')
      .select('*')
      .or(`name.ilike.%${searchTerm}%, prime_mover_muscle.ilike.%${searchTerm}%, primary_equipment.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching exercises_full:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} exercises matching search term "${searchTerm}"`);

    const uniqueMap = new Map<string, ExerciseFull>();

    (data || []).forEach(item => {
      const name = item.name?.toLowerCase().trim() || '';
      const existingItem = uniqueMap.get(name);
      const currentHasVideo = Boolean(getBestVideoUrl(item));
      const existingHasVideo = existingItem ? Boolean(getBestVideoUrl(existingItem)) : false;
      
      if (!existingItem || 
          (currentHasVideo && !existingHasVideo) ||
          (currentHasVideo && existingHasVideo && 
           (item.in_depth_youtube_exp && !existingItem.in_depth_youtube_exp))) {
        // Map the data to match ExerciseFull type
        const mappedItem: ExerciseFull = {
          ...item as any,
          id: normalizeExerciseId(item.id), // Ensure ID is a string
          video_demonstration_url: getBestVideoUrl(item),
          video_explanation_url: item.in_depth_youtube_exp || null,
          target_muscle_group: item.prime_mover_muscle || null
        } as ExerciseFull;
        
        uniqueMap.set(name, mappedItem);
      }
    });

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error('Failed to search exercises_full:', error);
    throw error;
  }
};
