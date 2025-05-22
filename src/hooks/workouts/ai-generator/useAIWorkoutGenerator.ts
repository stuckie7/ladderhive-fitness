
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIGenerationParams, GeneratedWorkout } from '@/types/workouts/ai-generator/types';
import { toStringId } from '@/utils/id-conversion';

// Define workout types to avoid deep instantiation
export type AIWorkoutGenerator = {
  params: AIGenerationParams;
  generateWorkout: (params: AIGenerationParams) => Promise<GeneratedWorkout | null>;
  refineWorkout: (exerciseIndex: number, changes: Partial<any>) => void;
  saveWorkout: (workout: any) => Promise<any>;
  generatedWorkout: GeneratedWorkout | null;
  isGenerating: boolean;
  error: string | null;
};

// Default params for the AI generator
const defaultParams: AIGenerationParams = {
  workoutType: 'strength',
  difficulty: 'intermediate',
  targetMuscleGroups: ['full body'],
  equipment: ['bodyweight', 'dumbbells'],
  duration: 45,
  intensity: 7
};

export function useAIWorkoutGenerator(): AIWorkoutGenerator {
  const [params, setParams] = useState<AIGenerationParams>(defaultParams);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = useCallback(async (newParams: AIGenerationParams): Promise<GeneratedWorkout | null> => {
    setIsGenerating(true);
    setError(null);
    setParams(newParams);
    
    try {
      // This is a placeholder - would need to implement actual workout generation
      console.log("Generating workout with params:", newParams);
      
      // Return mock workout data
      const mockWorkout: GeneratedWorkout = {
        name: `${newParams.workoutType.charAt(0).toUpperCase() + newParams.workoutType.slice(1)} Workout`,
        description: `AI generated ${newParams.difficulty} ${newParams.workoutType} workout focusing on ${newParams.targetMuscleGroups.join(', ')}`,
        exercises: [
          {
            name: "Barbell Squat",
            sets: 4,
            reps: 10,
            rest: 60,
            intensity: 8,
            muscleGroups: ["Quadriceps", "Glutes"],
            equipment: ["Barbell"],
            alternatives: ["Goblet Squat"],
            notes: "Focus on form and depth"
          },
          {
            name: "Push-Up",
            sets: 3,
            reps: 12,
            rest: 45,
            intensity: 7,
            muscleGroups: ["Chest", "Shoulders", "Triceps"],
            equipment: ["Bodyweight"],
            alternatives: ["Bench Press"],
            notes: "Keep core tight throughout the movement"
          }
        ],
        totalVolume: 1240,
        estimatedDuration: newParams.duration,
        recommendations: ["Hydrate well", "Focus on compound movements first"],
        rationale: "This workout is designed to target multiple muscle groups while respecting your equipment constraints."
      };
      
      setGeneratedWorkout(mockWorkout);
      return mockWorkout;
    } catch (err: any) {
      setError(err.message || "Failed to generate workout");
      console.error("Error generating workout:", err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const refineWorkout = useCallback((exerciseIndex: number, changes: Partial<any>) => {
    setGeneratedWorkout(prev => {
      if (!prev) return null;
      
      const updatedExercises = [...prev.exercises];
      updatedExercises[exerciseIndex] = { 
        ...updatedExercises[exerciseIndex],
        ...changes 
      };
      
      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  }, []);

  const saveWorkout = useCallback(async (workout: GeneratedWorkout) => {
    try {
      // Convert workout to proper format for database
      const workoutToSave = {
        title: workout.name || "AI Generated Workout",
        description: workout.description || "",
        difficulty: "intermediate",
        duration: workout.estimatedDuration || 30,
        exercises: workout.exercises.length,
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
    params,
    generateWorkout,
    refineWorkout,
    saveWorkout,
    generatedWorkout,
    isGenerating,
    error
  };
}

export default useAIWorkoutGenerator;
