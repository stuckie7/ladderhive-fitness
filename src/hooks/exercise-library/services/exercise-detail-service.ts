
import { supabase } from '@/integrations/supabase/client';
import { ExerciseFull } from '@/types/exercise';

export const getExerciseFullById = async (id: number | string): Promise<ExerciseFull | null> => {
  try {
    console.log(`Fetching exercise with ID ${id}`);
    
    // Ensure numeric ID for Supabase query
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const response = await supabase
      .from('exercises_full')
      .select('*')
      .eq('id', numericId)
      .single();
    
    if (response.error) {
      console.error(`Error fetching exercise with ID ${id}:`, response.error);
      throw response.error;
    }
    
    const { data } = response;
    console.log(`Exercise data found:`, data ? 'Yes' : 'No');
    
    // Transform the data to match our ExerciseFull type
    if (data) {
      // Clean up any URL fields that might have quotes in them
      const cleanYoutubeUrls = (url: string | null): string | null => {
        // If null or empty string, return null
        if (!url) return null;
        
        // Remove quotes if they exist in the URL
        const cleanUrl = url.replace(/^["']|["']$/g, '');
        
        // Return the cleaned URL, whether it's a real URL or just text like "Video Demonstration"
        return cleanUrl;
      };
      
      // Create a description if it doesn't exist
      const description = (data as any).description || 
        `${data.prime_mover_muscle || 'Muscle'} exercise using ${data.primary_equipment || 'equipment'}`;
      
      // Cast to ExerciseFull and add necessary properties
      const exerciseData: ExerciseFull = {
        ...data,
        // Add required properties for ExerciseFull type
        description,
        target_muscle_group: data.prime_mover_muscle || null,
        video_demonstration_url: cleanYoutubeUrls(data.short_youtube_demo) || null,
        video_explanation_url: cleanYoutubeUrls(data.in_depth_youtube_exp) || null,
        // Clean and map properties correctly, providing fallbacks for missing fields
        short_youtube_demo: cleanYoutubeUrls(data.short_youtube_demo),
        in_depth_youtube_exp: cleanYoutubeUrls(data.in_depth_youtube_exp),
        instructions: [] // Initialize as empty array, which is safer than null
      };
      
      return exerciseData;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch exercise with ID ${id}:`, error);
    throw error;
  }
};
