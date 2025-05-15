
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ExerciseFull } from "@/types/exercise";
import { supabase } from "@/integrations/supabase/client";
import { toNumericId } from "@/utils/id-conversion";

// Exercise form state type for consistent form handling
export interface ExerciseFormState {
  id?: string | number;
  name: string;
  description: string;
  difficulty?: string;
  prime_mover_muscle?: string;
  secondary_muscle?: string;
  tertiary_muscle?: string;
  primary_equipment?: string;
  secondary_equipment?: string;
  body_region?: string;
  mechanics?: string;
  force_type?: string;
  posture?: string;
  laterality?: string;
  instructions: string;
  short_youtube_demo?: string;
  in_depth_youtube_exp?: string;
  image_url: string;
}

// Default form state
export const defaultFormState: ExerciseFormState = {
  name: "",
  description: "",
  difficulty: "Beginner",
  prime_mover_muscle: "",
  secondary_muscle: "",
  primary_equipment: "Bodyweight",
  body_region: "Full Body",
  instructions: "",
  image_url: "",
};

// Exercise CRUD operations hook
export const useExerciseCrud = (onSuccess?: () => void) => {
  const [currentExercise, setCurrentExercise] = useState<ExerciseFull | null>(null);
  const [formState, setFormState] = useState<ExerciseFormState>(defaultFormState);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Initialize the form with current exercise data
  const openEditDialog = useCallback((exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
    
    // Map from ExerciseFull to form state
    setFormState({
      id: exercise.id,
      name: exercise.name || "",
      description: exercise.description || "",
      difficulty: exercise.difficulty || "Beginner",
      prime_mover_muscle: exercise.prime_mover_muscle || "",
      secondary_muscle: exercise.secondary_muscle || "",
      tertiary_muscle: exercise.tertiary_muscle || "",
      primary_equipment: exercise.primary_equipment || "Bodyweight",
      secondary_equipment: exercise.secondary_equipment || "",
      body_region: exercise.body_region || "Full Body",
      mechanics: exercise.mechanics || "",
      force_type: exercise.force_type || "",
      posture: exercise.posture || "",
      laterality: exercise.laterality || "",
      instructions: Array.isArray(exercise.instructions) 
        ? exercise.instructions.join("\n") 
        : (exercise.instructions || ""),
      short_youtube_demo: exercise.short_youtube_demo || "",
      in_depth_youtube_exp: exercise.in_depth_youtube_exp || "",
      image_url: exercise.image_url || exercise.youtube_thumbnail_url || "",
    });
  }, []);

  // Initialize the delete dialog
  const openDeleteDialog = useCallback((exercise: ExerciseFull) => {
    setCurrentExercise(exercise);
  }, []);

  // Handle form field changes
  const handleFormChange = useCallback((fieldName: keyof ExerciseFormState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  // Add a new exercise
  const handleAddExercise = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Prepare data for insertion
      const newExerciseData = {
        name: formState.name,
        description: formState.description,
        difficulty: formState.difficulty,
        prime_mover_muscle: formState.prime_mover_muscle,
        secondary_muscle: formState.secondary_muscle,
        tertiary_muscle: formState.tertiary_muscle,
        primary_equipment: formState.primary_equipment,
        secondary_equipment: formState.secondary_equipment,
        body_region: formState.body_region,
        mechanics: formState.mechanics,
        force_type: formState.force_type,
        posture: formState.posture,
        laterality: formState.laterality,
        instructions: formState.instructions,
        short_youtube_demo: formState.short_youtube_demo,
        in_depth_youtube_exp: formState.in_depth_youtube_exp,
        image_url: formState.image_url,
      };

      // Insert the new exercise
      const { data, error } = await supabase
        .from("exercises_full")
        .insert(newExerciseData)
        .select();

      if (error) {
        console.error("Error adding exercise:", error);
        toast({
          title: "Error",
          description: "Failed to add exercise: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Exercise added successfully",
      });

      // Reset form
      setFormState(defaultFormState);
      
      // Trigger refresh if callback provided
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error in handleAddExercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [formState, toast, onSuccess]);

  // Edit an existing exercise
  const handleEditExercise = useCallback(async () => {
    if (!currentExercise || !formState.id) {
      toast({
        title: "Error",
        description: "No exercise selected for editing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare update data
      const updateData = {
        name: formState.name,
        description: formState.description,
        difficulty: formState.difficulty,
        prime_mover_muscle: formState.prime_mover_muscle,
        secondary_muscle: formState.secondary_muscle,
        tertiary_muscle: formState.tertiary_muscle,
        primary_equipment: formState.primary_equipment,
        secondary_equipment: formState.secondary_equipment,
        body_region: formState.body_region,
        mechanics: formState.mechanics,
        force_type: formState.force_type,
        posture: formState.posture,
        laterality: formState.laterality,
        instructions: formState.instructions,
        short_youtube_demo: formState.short_youtube_demo,
        in_depth_youtube_exp: formState.in_depth_youtube_exp,
        image_url: formState.image_url,
      };

      // Convert ID to numeric for database query
      const numericId = toNumericId(formState.id);

      // Update the exercise
      const { data, error } = await supabase
        .from("exercises_full")
        .update(updateData)
        .eq("id", numericId)
        .select();

      if (error) {
        console.error("Error updating exercise:", error);
        toast({
          title: "Error",
          description: "Failed to update exercise: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });

      // Reset form
      setFormState(defaultFormState);
      setCurrentExercise(null);
      
      // Trigger refresh if callback provided
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error in handleEditExercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentExercise, formState, toast, onSuccess]);

  // Delete an exercise
  const handleDeleteExercise = useCallback(async () => {
    if (!currentExercise) {
      toast({
        title: "Error",
        description: "No exercise selected for deletion",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert ID to numeric for database query
      const numericId = toNumericId(currentExercise.id);

      // Delete the exercise
      const { error } = await supabase
        .from("exercises_full")
        .delete()
        .eq("id", numericId);

      if (error) {
        console.error("Error deleting exercise:", error);
        toast({
          title: "Error",
          description: "Failed to delete exercise: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });

      // Reset current exercise
      setCurrentExercise(null);
      
      // Trigger refresh if callback provided
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error in handleDeleteExercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentExercise, toast, onSuccess]);

  // Map ExerciseFull to Exercise for components that expect Exercise type
  const mapToExercise = useCallback((exerciseFull: ExerciseFull) => {
    return {
      id: exerciseFull.id,
      name: exerciseFull.name,
      description: exerciseFull.description || "",
      muscle_group: exerciseFull.prime_mover_muscle || "",
      equipment: exerciseFull.primary_equipment || "",
      difficulty: exerciseFull.difficulty || "",
      instructions: exerciseFull.instructions ? 
        (Array.isArray(exerciseFull.instructions) ? 
          exerciseFull.instructions : 
          [exerciseFull.instructions]) : 
        [],
      video_url: exerciseFull.short_youtube_demo || "",
      image_url: exerciseFull.image_url || exerciseFull.youtube_thumbnail_url || "",
      bodyPart: exerciseFull.body_region || "",
      target: exerciseFull.prime_mover_muscle || "",
    };
  }, []);

  return {
    currentExercise,
    formState,
    isProcessing,
    handleFormChange,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    openEditDialog,
    openDeleteDialog,
    mapToExercise,
  };
};
