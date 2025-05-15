
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Exercise, ExerciseFull } from "@/types/exercise";

export const useExerciseCrud = (onSuccess: () => void) => {
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  // Add a new exercise
  const addExercise = async (exercise: Exercise): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("exercises_full")
        .insert({
          name: exercise.name || "",
          difficulty: exercise.difficulty || null,
          prime_mover_muscle: exercise.prime_mover_muscle || exercise.target_muscle_group || null,
          primary_equipment: exercise.equipment_needed || exercise.equipment || null,
          short_youtube_demo: exercise.video_demonstration_url || null,
          in_depth_youtube_exp: exercise.video_explanation_url || null,
          description: exercise.description || null
          // Add other fields as needed
        })
        .select();
        
      if (error) {
        console.error("Error adding exercise:", error);
        toast({
          title: "Error",
          description: "Failed to add exercise",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Exercise added successfully"
      });
      
      onSuccess();
      return true;
      
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing exercise
  const updateExercise = async (id: string | number, exercise: Partial<ExerciseFull>): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Convert id to number if it's a string number
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Extract the primary equipment from appropriate properties
      const primaryEquipment = exercise.primary_equipment || 
                              (exercise as any).equipment_needed || 
                              (exercise as any).equipment || 
                              null;
      
      const { error } = await supabase
        .from("exercises_full")
        .update({
          name: exercise.name,
          difficulty: exercise.difficulty,
          prime_mover_muscle: exercise.prime_mover_muscle || exercise.target_muscle_group,
          primary_equipment: primaryEquipment,
          short_youtube_demo: exercise.short_youtube_demo || exercise.video_demonstration_url,
          in_depth_youtube_exp: exercise.in_depth_youtube_exp || exercise.video_explanation_url,
          description: exercise.description
          // Add other fields as needed
        })
        .eq("id", numericId);
        
      if (error) {
        console.error("Error updating exercise:", error);
        toast({
          title: "Error",
          description: "Failed to update exercise",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Exercise updated successfully"
      });
      
      onSuccess();
      return true;
      
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an exercise
  const deleteExercise = async (id: string | number): Promise<boolean> => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) {
      return false;
    }
    
    setLoading(true);
    
    try {
      // Convert id to number if it's a string number
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      const { error } = await supabase
        .from("exercises_full")
        .delete()
        .eq("id", numericId);
        
      if (error) {
        console.error("Error deleting exercise:", error);
        toast({
          title: "Error",
          description: "Failed to delete exercise",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Exercise deleted successfully"
      });
      
      onSuccess();
      return true;
      
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    addExercise,
    updateExercise,
    deleteExercise,
    isLoading
  };
};
