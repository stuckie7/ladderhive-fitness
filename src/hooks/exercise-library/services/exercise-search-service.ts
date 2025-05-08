
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const searchExercisesFull = async (
  searchTerm: string,
  limit = 20
): Promise<ExerciseFull[]> => {
  try {
    console.log(`Searching exercises with term "${searchTerm}" and limit ${limit}`);
    
    // Build the search query using ILIKE for case-insensitive matching
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
    
    // Enhanced deduplication that prioritizes entries with video links
    const uniqueMap = new Map<string, ExerciseFull>();
    
    (data || []).forEach(item => {
      // Normalize the name for case-insensitive comparison
      const name = item.name?.toLowerCase().trim() || '';
      if (!name) return; // Skip items with empty names
      
      const existingItem = uniqueMap.get(name);
      
      // Check if the current item has a video URL
      const hasVideo = Boolean(
        item.short_youtube_demo || 
        item.video_demonstration_url
      );
      
      // Check if existing item has a video URL
      const existingHasVideo = existingItem && Boolean(
        existingItem.short_youtube_demo || 
        existingItem.video_demonstration_url
      );
      
      // Add item if name doesn't exist yet in the map
      // OR if current item has video but existing one doesn't
      if (!existingItem || (hasVideo && !existingHasVideo)) {
        uniqueMap.set(name, item as ExerciseFull);
      }
    });
    
    const uniqueData = Array.from(uniqueMap.values());
    
    // Transform the data to match our ExerciseFull type
    const transformedData: ExerciseFull[] = uniqueData.map(item => ({
      ...item,
      // Map properties correctly
      target_muscle_group: item.prime_mover_muscle || null,
      video_demonstration_url: item.short_youtube_demo || null,
      video_explanation_url: item.in_depth_youtube_exp || null
    })) as ExerciseFull[];
    
    return transformedData;
  } catch (error) {
    console.error('Failed to search exercises_full:', error);
    throw error;
  }
};
