
import { useState, useCallback, ChangeEvent } from 'react';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { useToast } from '@/components/ui/use-toast';
import { 
  createExerciseInDatabase, 
  updateExerciseInDatabase, 
  deleteExerciseFromDatabase 
} from '../services/exercise-detail-service';
import { convertExerciseId } from '@/hooks/exercise-library';

// Update the ExerciseFormState type to match what's used in ExerciseFormDialog
export interface ExerciseFormState {
  id: string;  // Always use string for the ID in the form
  name: string;
  description: string;
  target_muscle_group: string;
  prime_mover_muscle: string; // Make this required to match expected type
  secondary_muscle: string;
  primary_equipment: string;
  difficulty: string;
  video_demonstration_url: string;
  image_url: string;
  instructions: string;
  // Additional fields
  [key: string]: string | undefined | null;
}

export const useExerciseCrud = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState<ExerciseFormState>({
    id: '',
    name: '',
    description: '',
    target_muscle_group: '',
    prime_mover_muscle: '', // Initialize with empty string
    secondary_muscle: '',
    primary_equipment: '',
    difficulty: 'Beginner',
    video_demonstration_url: '',
    image_url: '',
    instructions: '',
  });

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState({
      id: '',
      name: '',
      description: '',
      target_muscle_group: '',
      prime_mover_muscle: '',
      secondary_muscle: '',
      primary_equipment: '',
      difficulty: 'Beginner',
      video_demonstration_url: '',
      image_url: '',
      instructions: '',
    });
  }, []);

  // Handle form field changes
  const handleFormChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  // Initialize form with exercise data for editing
  const initFormWithExercise = useCallback((exercise: Exercise | ExerciseFull) => {
    setFormState({
      id: String(exercise.id), // Ensure ID is a string
      name: exercise.name || '',
      description: exercise.description || '',
      target_muscle_group: exercise.target_muscle_group || exercise.target || '',
      prime_mover_muscle: exercise.prime_mover_muscle || '',
      secondary_muscle: exercise.secondary_muscle || '',
      primary_equipment: exercise.primary_equipment || exercise.equipment || '',
      difficulty: exercise.difficulty || 'Beginner',
      video_demonstration_url: (exercise as ExerciseFull).video_demonstration_url || exercise.video_url || '',
      image_url: exercise.image_url || '',
      instructions: Array.isArray(exercise.instructions) 
        ? exercise.instructions.join('\n') 
        : exercise.instructions || '',
    });
  }, []);

  // Add new exercise
  const handleAddExercise = useCallback(async (): Promise<boolean> => {
    try {
      // Convert form state to ExerciseFull format
      const exerciseData: Partial<ExerciseFull> = {
        name: formState.name,
        description: formState.description,
        target_muscle_group: formState.target_muscle_group,
        prime_mover_muscle: formState.prime_mover_muscle,
        secondary_muscle: formState.secondary_muscle,
        primary_equipment: formState.primary_equipment,
        difficulty: formState.difficulty,
        video_demonstration_url: formState.video_demonstration_url,
        short_youtube_demo: formState.video_demonstration_url,
        in_depth_youtube_exp: formState.video_demonstration_url,
        image_url: formState.image_url,
        instructions: formState.instructions.split('\n'),
      };

      await createExerciseInDatabase(exerciseData);
      
      toast({
        title: "Exercise Created",
        description: "New exercise has been added to the database",
      });
      
      resetForm();
      return true;
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast({
        title: "Error",
        description: "Failed to create exercise",
        variant: "destructive",
      });
      return false;
    }
  }, [formState, toast, resetForm]);

  // Edit existing exercise
  const handleEditExercise = useCallback(async (): Promise<boolean> => {
    try {
      if (!formState.id) {
        throw new Error('Exercise ID is required for updating');
      }

      // Convert form state to ExerciseFull format, ensuring the ID is properly formatted
      const exerciseData: Partial<ExerciseFull> = {
        id: formState.id, // ID is already a string
        name: formState.name,
        description: formState.description,
        target_muscle_group: formState.target_muscle_group,
        prime_mover_muscle: formState.prime_mover_muscle,
        secondary_muscle: formState.secondary_muscle,
        primary_equipment: formState.primary_equipment,
        difficulty: formState.difficulty,
        video_demonstration_url: formState.video_demonstration_url,
        short_youtube_demo: formState.video_demonstration_url,
        in_depth_youtube_exp: formState.video_demonstration_url,
        image_url: formState.image_url,
        instructions: formState.instructions.split('\n'),
      };

      await updateExerciseInDatabase(exerciseData);
      
      toast({
        title: "Exercise Updated",
        description: "Exercise has been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast({
        title: "Error",
        description: "Failed to update exercise",
        variant: "destructive",
      });
      return false;
    }
  }, [formState, toast]);

  // Delete exercise
  const handleDeleteExercise = useCallback(async (exercise: Exercise | ExerciseFull): Promise<boolean> => {
    try {
      await deleteExerciseFromDatabase(exercise.id);
      
      toast({
        title: "Exercise Deleted",
        description: "Exercise has been removed from the database",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Error",
        description: "Failed to delete exercise",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    formState,
    handleFormChange,
    initFormWithExercise,
    handleAddExercise,
    handleEditExercise,
    handleDeleteExercise,
    resetForm,
  };
};
