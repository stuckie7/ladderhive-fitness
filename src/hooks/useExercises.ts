
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
  video_demonstration_url?: string;
  video_explanation_url?: string;
  video_url?: string;
  target_muscle_group?: string;
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
          id: String(item.id), // Convert ID to string
          name: String(item.name || '')
        };
        
        // Then add all properties from the database result
        if (item.body_region) exercise.body_region = item.body_region;
        if (item.bodyPart) exercise.bodyPart = item.bodyPart;
        if (item.prime_mover_muscle) {
          exercise.prime_mover_muscle = item.prime_mover_muscle;
          exercise.target_muscle_group = item.prime_mover_muscle;
          exercise.muscle_group = item.prime_mover_muscle;
          exercise.target = item.prime_mover_muscle;
        }
        if (item.primary_equipment) {
          exercise.primary_equipment = item.primary_equipment;
          exercise.equipment = item.primary_equipment;
        }
        if (item.target_muscle_group) exercise.target_muscle_group = item.target_muscle_group;
        if (item.difficulty) exercise.difficulty = item.difficulty;
        if (item.short_youtube_demo) exercise.short_youtube_demo = item.short_youtube_demo;
        if (item.in_depth_youtube_exp) exercise.in_depth_youtube_exp = item.in_depth_youtube_exp;
        if (item.youtube_thumbnail_url) exercise.youtube_thumbnail_url = item.youtube_thumbnail_url;
        if (item.secondary_muscle) exercise.secondary_muscle = item.secondary_muscle;
        if (item.tertiary_muscle) exercise.tertiary_muscle = item.tertiary_muscle;
        if (item.secondary_equipment) exercise.secondary_equipment = item.secondary_equipment;
        if (item.description) exercise.description = item.description;
        if (item.instructions) exercise.instructions = item.instructions;
        if (item.image_url) exercise.image_url = item.image_url;
        if (item.video_demonstration_url) exercise.video_demonstration_url = item.video_demonstration_url;
        if (item.video_explanation_url) exercise.video_explanation_url = item.video_explanation_url;
        if (item.video_url) exercise.video_url = item.video_url;
        
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
