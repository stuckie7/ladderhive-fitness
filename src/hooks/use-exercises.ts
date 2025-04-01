
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '@/pages/ExerciseLibrary';

export const useExercises = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getExerciseById = async (id: string): Promise<Exercise | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Exercise;
    } catch (error: any) {
      console.error("Error fetching exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exercise details.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('muscle_group', muscleGroup)
        .order('name');
      
      if (error) throw error;
      
      return data as Exercise[];
    } catch (error: any) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exercises.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const searchExercises = async (query: string): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name');
      
      if (error) throw error;
      
      return data as Exercise[];
    } catch (error: any) {
      console.error("Error searching exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search exercises.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getExerciseById,
    getExercisesByMuscleGroup,
    searchExercises
  };
};
