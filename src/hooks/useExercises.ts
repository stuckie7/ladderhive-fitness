
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";

export const useExercises = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchExercises = useCallback(async (query: string): Promise<Exercise[]> => {
    if (!query) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      
      // Map database results to Exercise interface
      const exercises: Exercise[] = (data || []).map(item => ({
        id: item.id.toString(),
        name: item.name,
        bodyPart: item.body_region,
        target: item.prime_mover_muscle,
        equipment: item.primary_equipment,
        muscle_group: item.prime_mover_muscle,
        // Handle missing properties with checks
        description: 'description' in item ? item.description : '',
        difficulty: item.difficulty,
        short_youtube_demo: item.short_youtube_demo,
        in_depth_youtube_exp: item.in_depth_youtube_exp,
        youtube_thumbnail_url: item.youtube_thumbnail_url,
        prime_mover_muscle: item.prime_mover_muscle,
        secondary_muscle: item.secondary_muscle,
        tertiary_muscle: item.tertiary_muscle,
        primary_equipment: item.primary_equipment,
        secondary_equipment: item.secondary_equipment,
        target_muscle_group: item.prime_mover_muscle || '',
        // Adding compatible properties
        image_url: 'image_url' in item ? item.image_url : item.youtube_thumbnail_url || '',
        // Add instructions if present
        instructions: 'instructions' in item && item.instructions ? 
          (Array.isArray(item.instructions) ? item.instructions : [item.instructions]) : [],
      }));
      
      return exercises;
    } catch (error: any) {
      console.error("Error searching exercises:", error);
      toast({
        title: "Search failed",
        description: "Failed to search exercises",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    searchExercises,
    isLoading
  };
};
