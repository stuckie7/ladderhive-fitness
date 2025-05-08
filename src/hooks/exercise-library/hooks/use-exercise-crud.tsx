
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseFull } from "@/types/exercise";
import { useToast } from "@/components/ui/use-toast";

type ExerciseFormState = {
  name: string;
  prime_mover_muscle: string;
  primary_equipment: string;
  difficulty: string;
  short_youtube_demo: string;
};

export const useExerciseCrud = (onSuccess: () => void) => {
  const [currentExercise, setCurrentExercise] = useState<ExerciseFull | null>(null);
  const [formState, setFormState] = useState<ExerciseFormState>({
    name: "",
    prime_mover_muscle: "",
    primary_equipment: "",
    difficulty: "Beginner",
    short_youtube_demo: ""
  });
  
  const { toast } = useToast();

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle add exercise
  const handleAddExercise = async () => {
    try {
      const { error } = await supabase
        .from('exercises_full')
        .insert([{
          name: formState.name,
          prime_mover_muscle: formState.prime_mover_muscle,
          primary_equipment: formState.primary_equipment,
          difficulty: formState.difficulty,
          short_youtube_demo: formState.short_youtube_demo
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Exercise Added",
        description: `Successfully added ${formState.name}`,
      });
      
      // Reset form
      setFormState({
        name: "",
        prime_mover_muscle: "",
        primary_equipment: "",
        difficulty: "Beginner",
        short_youtube_demo: ""
      });
      
      // Refresh the exercise list
      onSuccess();
    } catch (error) {
      console.error("Failed to add exercise:", error);
      toast({
        title: "Error",
        description: "Failed to add exercise. Check the console for details.",
        variant: "destructive"
      });
    }
  };
  
  // Handle edit exercise
  const handleEditExercise = async () => {
    if (!currentExercise) return;
    
    try {
      const { error } = await supabase
        .from('exercises_full')
        .update({
          name: formState.name,
          prime_mover_muscle: formState.prime_mover_muscle,
          primary_equipment: formState.primary_equipment,
          difficulty: formState.difficulty,
          short_youtube_demo: formState.short_youtube_demo
        })
        .eq('id', currentExercise.id);
      
      if (error) throw error;
      
      toast({
        title: "Exercise Updated",
        description: `Successfully updated ${formState.name}`,
      });
      
      // Refresh the exercise list
      onSuccess();
    } catch (error) {
      console.error("Failed to update exercise:", error);
      toast({
        title: "Error",
        description: "Failed to update exercise. Check the console for details.",
        variant: "destructive"
      });
    }
  };
  
  // Handle delete exercise
  const handleDeleteExercise = async () => {
    if (!currentExercise) return;
    
    try {
      const { error } = await supabase
        .from('exercises_full')
        .delete()
        .eq('id', currentExercise.id);
      
      if (error) throw error;
      
      toast({
        title: "Exercise Deleted",
        description: `Successfully deleted ${currentExercise.name}`,
      });
      
      // Refresh the exercise list
      onSuccess();
    } catch (error) {
      console.error("Failed to delete exercise:", error);
      toast({
        title: "Error",
        description: "Failed to delete exercise. Check the console for details.",
        variant: "destructive"
      });
    }
  };
  
  // Open edit dialog with exercise data
  const openEditDialog = (exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
    setFormState({
      name: exercise.name || "",
      prime_mover_muscle: exercise.prime_mover_muscle || "",
      primary_equipment: exercise.primary_equipment || "",
      difficulty: exercise.difficulty || "Beginner",
      short_youtube_demo: exercise.short_youtube_demo || ""
    });
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
  };

  return {
    formState,
    currentExercise,
    handleFormChange,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    openEditDialog,
    openDeleteDialog
  };
};
