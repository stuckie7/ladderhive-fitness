
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Exercise, ExerciseFull } from "@/types/exercise";

// Initial form state for new exercises
const initialFormState = {
  name: "",
  description: "",
  muscle_group: "",
  primary_equipment: "",
  difficulty: "",
  body_region: "",
  instructions: "",
  video_url: "",
  image_url: ""
};

export const useExerciseCrud = (onSuccess: () => Promise<void>) => {
  const [formState, setFormState] = useState(initialFormState);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const { toast } = useToast();

  // Import multiple exercises
  const addExercises = async (exercisesToAdd: Exercise[]): Promise<boolean> => {
    try {
      // Convert exercises to the format expected by the exercises table
      const formattedExercises = exercisesToAdd.map(ex => ({
        id: typeof ex.id === 'number' ? ex.id : parseInt(ex.id as string, 10),
        name: ex.name,
        muscle_group: ex.target || ex.bodyPart || "",
        equipment: ex.equipment || "",
        description: `${ex.name} exercise targeting ${ex.target || "muscles"}`,
        video_url: ex.gifUrl || "",
        image_url: ex.gifUrl || "",
      }));

      const { error } = await supabase
        .from("exercises")
        .upsert(formattedExercises, {
          onConflict: "id"
        });

      if (error) {
        console.error("Error adding exercises:", error);
        toast({
          title: "Error",
          description: `Failed to add exercises: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: `${exercisesToAdd.length} exercises added successfully`,
      });
      
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error in addExercises:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add a single exercise
  const addExercise = async (exercise: Exercise): Promise<boolean> => {
    try {
      // Create a correctly typed exercise object
      const newExercise = {
        name: exercise.name,
        description: exercise.description || "",
        muscle_group: exercise.muscle_group || exercise.target || "",
        equipment: exercise.equipment || exercise.primary_equipment || "",
        difficulty: exercise.difficulty || "",
        video_url: exercise.video_url || exercise.gifUrl || "",
        image_url: exercise.image_url || exercise.gifUrl || "",
        instructions: exercise.instructions?.join("\n") || "",
      };
      
      const { error } = await supabase
        .from("exercises")
        .insert(newExercise);

      if (error) {
        toast({
          title: "Error",
          description: `Failed to add exercise: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: `Exercise "${exercise.name}" added successfully`,
      });
      
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error in addExercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update an exercise
  const updateExercise = async (id: string | number, exercise: Partial<ExerciseFull>): Promise<boolean> => {
    try {
      // Convert id to string for database queries
      const exerciseId = id.toString();
      
      // Create a clean exercise object for update
      const updateData: Partial<ExerciseFull> = {
        name: exercise.name,
        description: exercise.description,
        prime_mover_muscle: exercise.prime_mover_muscle,
        primary_equipment: exercise.primary_equipment,
        difficulty: exercise.difficulty,
        body_region: exercise.body_region,
        // Include other fields as needed
      };
      
      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const { error } = await supabase
        .from("exercises_full")
        .update(updateData)
        .eq("id", exerciseId);

      if (error) {
        toast({
          title: "Error",
          description: `Failed to update exercise: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: `Exercise updated successfully`,
      });
      
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error in updateExercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete an exercise
  const deleteExercise = async (id: string | number): Promise<boolean> => {
    try {
      // Convert id to string for database queries
      const exerciseId = id.toString();
      
      const { error } = await supabase
        .from("exercises_full")
        .delete()
        .eq("id", exerciseId);

      if (error) {
        toast({
          title: "Error",
          description: `Failed to delete exercise: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: `Exercise deleted successfully`,
      });
      
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error in deleteExercise:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting",
        variant: "destructive"
      });
      return false;
    }
  };

  // Form handling
  const handleFormChange = (field: string, value: string | number | boolean) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Set up form for adding new exercise
  const openAddDialog = () => {
    setFormState(initialFormState);
    setCurrentExercise(null);
  };

  // Set up form for editing an exercise
  const openEditDialog = (exercise: Exercise | ExerciseFull) => {
    setFormState({
      name: exercise.name || "",
      description: exercise.description || "",
      muscle_group: exercise.muscle_group || exercise.prime_mover_muscle || "",
      primary_equipment: exercise.primary_equipment || exercise.equipment || "",
      difficulty: exercise.difficulty || "",
      body_region: exercise.bodyPart || exercise.body_region || "",
      instructions: Array.isArray(exercise.instructions) 
        ? exercise.instructions.join("\n") 
        : exercise.instructions || "",
      video_url: exercise.video_url || exercise.short_youtube_demo || "",
      image_url: exercise.image_url || exercise.youtube_thumbnail_url || ""
    });
    setCurrentExercise(exercise as Exercise);
  };

  // Set up for deleting an exercise
  const openDeleteDialog = (exercise: Exercise | ExerciseFull) => {
    setCurrentExercise(exercise as Exercise);
  };

  // Handle form submission for adding an exercise
  const handleAddExercise = async () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: formState.name,
      description: formState.description,
      muscle_group: formState.muscle_group,
      equipment: formState.primary_equipment,
      difficulty: formState.difficulty,
      instructions: formState.instructions ? [formState.instructions] : [],
      video_url: formState.video_url,
      image_url: formState.image_url,
      bodyPart: formState.body_region
    };
    
    return addExercise(newExercise);
  };

  // Handle form submission for editing an exercise
  const handleEditExercise = async () => {
    if (!currentExercise) return false;
    
    const updatedExercise: Partial<ExerciseFull> = {
      name: formState.name,
      description: formState.description,
      prime_mover_muscle: formState.muscle_group,
      primary_equipment: formState.primary_equipment,
      difficulty: formState.difficulty,
      body_region: formState.body_region,
      short_youtube_demo: formState.video_url,
      youtube_thumbnail_url: formState.image_url
    };
    
    return updateExercise(currentExercise.id, updatedExercise);
  };

  // Handle exercise deletion
  const handleDeleteExercise = async () => {
    if (!currentExercise) return false;
    
    return deleteExercise(currentExercise.id);
  };

  return {
    formState,
    currentExercise,
    addExercise,
    addExercises,
    updateExercise,
    deleteExercise,
    handleFormChange,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    openAddDialog,
    openEditDialog,
    openDeleteDialog
  };
};
