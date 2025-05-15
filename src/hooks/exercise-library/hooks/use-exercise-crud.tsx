
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";

export const useExerciseCrud = (onRefreshData: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  // Add state for form and current exercise
  const [formState, setFormState] = useState<Partial<ExerciseFull>>({});
  const [currentExercise, setCurrentExercise] = useState<ExerciseFull | null>(null);
  const { toast } = useToast();

  const addExercise = async (exercise: Partial<ExerciseFull>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Fix by casting to any to avoid TypeScript errors
      const { data, error } = await supabase
        .from('exercises_full')
        .insert([exercise as any])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Exercise added successfully",
      });
      
      // Refresh data after adding
      await onRefreshData();
      return true;
    } catch (error: any) {
      console.error("Failed to add exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add exercise",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExercise = async (id: string | number, exercise: Partial<ExerciseFull>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Fix by casting to any to avoid TypeScript errors
      const { error } = await supabase
        .from('exercises_full')
        .update(exercise as any)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
      
      // Refresh data after updating
      await onRefreshData();
      return true;
    } catch (error: any) {
      console.error("Failed to update exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update exercise",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExercise = async (id: string | number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('exercises_full')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
      
      // Refresh data after deleting
      await onRefreshData();
      return true;
    } catch (error: any) {
      console.error("Failed to delete exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete exercise",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Open the edit dialog with the current exercise data
  const openEditDialog = (exercise: ExerciseFull) => {
    setFormState(exercise);
    setCurrentExercise(exercise);
  };

  // Open the delete dialog with the current exercise data
  const openDeleteDialog = (exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
  };

  // Handle adding an exercise
  const handleAddExercise = async () => {
    const result = await addExercise(formState);
    if (result) {
      setFormState({}); // Reset form after successful add
    }
    return result;
  };

  // Handle editing an exercise
  const handleEditExercise = async () => {
    if (!currentExercise?.id) return false;
    
    const result = await updateExercise(currentExercise.id, formState);
    if (result) {
      setFormState({}); // Reset form after successful edit
      setCurrentExercise(null);
    }
    return result;
  };

  // Handle deleting an exercise
  const handleDeleteExercise = async () => {
    if (!currentExercise?.id) return false;
    
    const result = await deleteExercise(currentExercise.id);
    if (result) {
      setCurrentExercise(null);
    }
    return result;
  };

  return {
    isLoading,
    addExercise,
    updateExercise,
    deleteExercise,
    formState,
    currentExercise,
    handleFormChange,
    openEditDialog,
    openDeleteDialog,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise
  };
};
