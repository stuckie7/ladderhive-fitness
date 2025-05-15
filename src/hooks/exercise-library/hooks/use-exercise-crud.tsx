// Only updating the ExerciseFormState interface to align with what's used in ExerciseLibraryEnhanced

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseFull } from "@/types/exercise";
import { getExerciseFullById, updateExerciseFull, deleteExerciseFull } from "../services/exercise-detail-service";

// Update the ExerciseFormState interface
export interface ExerciseFormState {
  id?: string | number;
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  body_region?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  prime_mover_muscle?: string; // Make this optional
  primary_equipment?: string;
  short_youtube_demo?: string;
}

interface UseExerciseCrudResult {
  formState: ExerciseFormState;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddExercise: () => Promise<void>;
  handleEditExercise: () => Promise<void>;
  handleDeleteExercise: (exercise: Exercise) => Promise<void>;
  openEditDialog: (exercise: Exercise) => void;
  openDeleteDialog: (exercise: Exercise) => void;
}

export const useExerciseCrud = (handleRefresh: () => void): UseExerciseCrudResult => {
  const [formState, setFormState] = useState<ExerciseFormState>({
    name: '',
    description: '',
    muscle_group: '',
    equipment: '',
    difficulty: '',
    body_region: '',
    instructions: '',
    video_url: '',
    image_url: '',
    prime_mover_muscle: '',
    primary_equipment: '',
    short_youtube_demo: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddExercise = async () => {
    try {
      // Omit the id property when creating a new exercise
      const { id, ...exerciseData } = formState;
      
      const { data, error } = await supabase
        .from('exercises_full')
        .insert([exerciseData])
        .select()
        .single();
      
      if (error) {
        console.error("Error adding exercise:", error);
        return;
      }
      
      console.log("Exercise added successfully:", data);
      handleRefresh();
      resetForm();
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  const handleEditExercise = async () => {
    if (!formState.id) {
      console.error("Exercise ID is missing for edit.");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .update(formState)
        .eq('id', formState.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating exercise:", error);
        return;
      }
      
      console.log("Exercise updated successfully:", data);
      handleRefresh();
      resetForm();
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  };

  const handleDeleteExercise = async (exercise: Exercise) => {
    if (!exercise.id) {
      console.error("Exercise ID is missing for deletion.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('exercises_full')
        .delete()
        .eq('id', exercise.id);
      
      if (error) {
        console.error("Error deleting exercise:", error);
        return;
      }
      
      console.log("Exercise deleted successfully");
      handleRefresh();
      resetForm();
    } catch (error) {
      console.error("Error deleting exercise:", error);
    }
  };

  const openEditDialog = (exercise: Exercise) => {
    setFormState({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || '',
      equipment: exercise.equipment || '',
      difficulty: exercise.difficulty || '',
      body_region: exercise.bodyPart || '',
      instructions: exercise.instructions ? exercise.instructions.join('\n') : '',
      video_url: exercise.video_url || '',
      image_url: exercise.image_url || '',
      prime_mover_muscle: exercise.prime_mover_muscle || '',
      primary_equipment: exercise.primary_equipment || '',
      short_youtube_demo: exercise.short_youtube_demo || ''
    });
  };

  const openDeleteDialog = (exercise: Exercise) => {
    // No specific action needed here, the state is managed in the parent component
  };

  const resetForm = () => {
    setFormState({
      name: '',
      description: '',
      muscle_group: '',
      equipment: '',
      difficulty: '',
      body_region: '',
      instructions: '',
      video_url: '',
      image_url: '',
      prime_mover_muscle: '',
      primary_equipment: '',
      short_youtube_demo: ''
    });
  };

  return {
    formState,
    handleFormChange,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    openEditDialog,
    openDeleteDialog
  };
};
