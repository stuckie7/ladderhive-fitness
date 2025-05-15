
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { mapExerciseToExerciseFull } from '../mappers';

export const useExerciseCrud = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addExercise = useCallback(async (exercise: Exercise): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Map to full exercise format
      const fullExercise = mapExerciseToExerciseFull(exercise);
      
      // Insert into exercises_full table
      const { error } = await supabase
        .from('exercises_full')
        .insert([fullExercise]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Exercise "${exercise.name}" has been added.`,
      });
      return true;
    } catch (error: any) {
      console.error('Failed to add exercise:', error);
      toast({
        title: "Error",
        description: `Failed to add exercise: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateExercise = useCallback(async (id: string | number, exercise: Exercise): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Ensure numeric ID for Supabase query
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Map to full exercise format
      const fullExercise = mapExerciseToExerciseFull(exercise);
      
      // Update exercises_full table
      const { error } = await supabase
        .from('exercises_full')
        .update(fullExercise)
        .eq('id', numericId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Exercise "${exercise.name}" has been updated.`,
      });
      return true;
    } catch (error: any) {
      console.error('Failed to update exercise:', error);
      toast({
        title: "Error",
        description: `Failed to update exercise: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteExercise = useCallback(async (id: string | number): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Ensure numeric ID for Supabase query
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Delete from exercises_full table
      const { error } = await supabase
        .from('exercises_full')
        .delete()
        .eq('id', numericId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Exercise has been deleted.`,
      });
      return true;
    } catch (error: any) {
      console.error('Failed to delete exercise:', error);
      toast({
        title: "Error",
        description: `Failed to delete exercise: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    addExercise,
    updateExercise,
    deleteExercise
  };
};
