
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";

// Extended interface to ensure type safety with database results
interface ExerciseFullData {
  id: number;
  name: string;
  body_region?: string;
  prime_mover_muscle?: string;
  primary_equipment?: string;
  difficulty?: string;
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  youtube_thumbnail_url?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  secondary_equipment?: string;
  description?: string;
  instructions?: string[] | string;
  image_url?: string;
  [key: string]: any; // Allow other properties from database
}

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
      
      // Map database results to Exercise interface with type safety
      const exercises: Exercise[] = (data || []).map((item: ExerciseFullData) => {
        // First create a base object with required properties
        const exercise: Exercise = {
          id: String(item.id),
          name: String(item.name || ''),
          bodyPart: String(item.body_region || ''),
          target: String(item.prime_mover_muscle || ''),
          equipment: String(item.primary_equipment || ''),
          muscle_group: String(item.prime_mover_muscle || ''),
        };
        
        // Then add optional properties if they exist in the data
        if ('description' in item) exercise.description = String(item.description || '');
        if ('difficulty' in item) exercise.difficulty = String(item.difficulty || '');
        if ('short_youtube_demo' in item) exercise.short_youtube_demo = item.short_youtube_demo;
        if ('in_depth_youtube_exp' in item) exercise.in_depth_youtube_exp = item.in_depth_youtube_exp;
        if ('youtube_thumbnail_url' in item) exercise.youtube_thumbnail_url = item.youtube_thumbnail_url;
        if ('prime_mover_muscle' in item) exercise.prime_mover_muscle = item.prime_mover_muscle;
        if ('secondary_muscle' in item) exercise.secondary_muscle = item.secondary_muscle;
        if ('tertiary_muscle' in item) exercise.tertiary_muscle = item.tertiary_muscle;
        if ('primary_equipment' in item) exercise.primary_equipment = item.primary_equipment;
        if ('secondary_equipment' in item) exercise.secondary_equipment = item.secondary_equipment;
        if ('target_muscle_group' in item) exercise.target_muscle_group = String(item.target_muscle_group || item.prime_mover_muscle || '');
        
        // Handle image URL with fallbacks
        exercise.image_url = String(item.image_url || item.youtube_thumbnail_url || '');
        
        // Handle instructions with type safety
        if ('instructions' in item && item.instructions) {
          if (Array.isArray(item.instructions)) {
            exercise.instructions = item.instructions;
          } else {
            exercise.instructions = [String(item.instructions)];
          }
        } else {
          exercise.instructions = [];
        }
        
        return exercise;
      });
      
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
