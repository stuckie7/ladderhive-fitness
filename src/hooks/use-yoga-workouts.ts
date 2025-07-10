
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export interface YogaWorkout {
  id: string;
  name: string;
  short_youtube_demo?: string | null;
  in_depth_youtube_exp?: string | null;
  difficulty?: string | null;
  prime_mover_muscle?: string | null;
  secondary_muscle?: string | null;
  tertiary_muscle?: string | null;
  body_region?: string | null;
  youtube_thumbnail_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  
  // Adding these properties to fix type errors
  timeCategory?: "quick" | "short" | "long" | null;
  stressCategory?: "work" | "sleep" | "refresh" | null;
  intensityCategory?: "gentle" | "moderate" | "restorative" | null;
}

export const useYogaWorkouts = () => {
  const [workouts, setWorkouts] = useState<YogaWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const fetchYogaWorkouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('yoga_workouts')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setWorkouts(data || []);
    } catch (error: any) {
      console.error("Error fetching yoga workouts:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load yoga workouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchYogaWorkouts();
  }, []);
  
  const getWorkoutById = async (id: string): Promise<YogaWorkout | null> => {
    try {
      const { data, error } = await supabase
        .from('yoga_workouts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Error fetching yoga workout with ID ${id}:`, error);
      toast({
        title: "Error",
        description: "Failed to load the specified yoga workout.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const getWorkoutsByDifficulty = async (difficulty: string): Promise<YogaWorkout[]> => {
    try {
      const { data, error } = await supabase
        .from('yoga_workouts')
        .select('*')
        .eq('difficulty', difficulty)
        .order('name');
        
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching yoga workouts with difficulty ${difficulty}:`, error);
      toast({
        title: "Error",
        description: "Failed to load yoga workouts by difficulty.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  return {
    workouts,
    isLoading,
    error,
    fetchYogaWorkouts,
    getWorkoutById,
    getWorkoutsByDifficulty
  };
};
