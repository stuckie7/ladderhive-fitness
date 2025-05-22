
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define workout types to avoid deep instantiation
export type AIWorkoutGenerator = {
  generateWorkout: (params: any) => Promise<any>;
  saveWorkout: (workout: any) => Promise<any>;
  isGenerating: boolean;
  error: string | null;
};

export function useAIWorkoutGenerator(): AIWorkoutGenerator {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = useCallback(async (params: any) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // This is a placeholder - would need to implement actual workout generation
      console.log("Generating workout with params:", params);
      
      // Return mock workout data
      return {
        title: "Generated Workout",
        description: "AI generated workout",
        difficulty: "intermediate",
        duration: 45,
        exercises: []
      };
    } catch (err: any) {
      setError(err.message || "Failed to generate workout");
      console.error("Error generating workout:", err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveWorkout = useCallback(async (workout: any) => {
    try {
      // Convert workout to proper format for database
      const workoutToSave = {
        title: workout.title || "AI Generated Workout",
        description: workout.description || "",
        difficulty: workout.difficulty || "intermediate",
        duration: workout.duration || 30,
        exercises: workout.exercises?.length || 0,
        user_id: "user_id",  // This should be replaced with actual user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await supabase
        .from('workouts')
        .insert([workoutToSave])
        .select();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Error saving workout:", err);
      throw err;
    }
  }, []);

  return {
    generateWorkout,
    saveWorkout,
    isGenerating,
    error
  };
}

export default useAIWorkoutGenerator;
