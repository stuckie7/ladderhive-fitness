
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { createExerciseDetailService } from "../services/exercise-detail-service";

interface ExerciseCrudResult {
  addExercise: (exercise: Exercise) => Promise<boolean>;
  updateExercise: (id: string | number, exercise: Partial<ExerciseFull>) => Promise<boolean>;
  deleteExercise: (id: string | number) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export const useExerciseCrud = (): ExerciseCrudResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const exerciseService = createExerciseDetailService();

  // Add a new exercise
  const addExercise = useCallback(async (exercise: Exercise): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("exercises")
        .insert([
          {
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            equipment: exercise.equipment,
            gifUrl: exercise.gifUrl,
            target: exercise.target,
            id: exercise.id,
          },
        ]);

      if (error) throw error;
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      return true;
    } catch (err: any) {
      console.error("Error adding exercise:", err);
      setError(err instanceof Error ? err : new Error("Failed to add exercise"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Update an existing exercise
  const updateExercise = useCallback(
    async (id: string | number, exerciseData: Partial<ExerciseFull>): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        // Handle the specific properties for exerciseFull
        const exerciseDataForUpdate = {
          ...exerciseData,
          // Handle primary_equipment separately if it doesn't exist in the original type
          primary_equipment: exerciseData.primary_equipment || undefined
        };

        const updatedExercise = await exerciseService.updateExercise(id, exerciseDataForUpdate);
        
        if (!updatedExercise) {
          throw new Error('Failed to update exercise');
        }
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
        queryClient.invalidateQueries({ queryKey: ["exercise", id] });
        
        return true;
      } catch (err: any) {
        console.error("Error updating exercise:", err);
        setError(err instanceof Error ? err : new Error("Failed to update exercise"));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, exerciseService]
  );

  // Delete an exercise
  const deleteExercise = useCallback(
    async (id: string | number): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const { error } = await supabase
          .from("exercises_full")
          .delete()
          .eq("id", id.toString());

        if (error) throw error;
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ["exercises"] });
        return true;
      } catch (err: any) {
        console.error("Error deleting exercise:", err);
        setError(err instanceof Error ? err : new Error("Failed to delete exercise"));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  return {
    addExercise,
    updateExercise,
    deleteExercise,
    isLoading,
    error,
  };
};
