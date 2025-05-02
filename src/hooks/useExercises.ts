import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Exercise } from '@/types/exercise';
import * as exerciseApi from '@/integrations/exercisedb/client';
import { supabase } from '@/integrations/supabase/client';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rawExercisesData, setRawExercisesData] = useState<any[]>([]);
  const itemsPerPage = 12;
  const { toast } = useToast();

  // New function to fetch raw exercise data from Supabase
  const getRawExercisesData = async (limit = 10) => {
    setLoading(true);
    try {
      // Query the exercises_full table for the first 10 rows
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Map the data to include required fields for ExerciseFull
        const mappedData = data.map(item => ({
          ...item,
          target_muscle_group: item.prime_mover_muscle || null,
          video_demonstration_url: item.short_youtube_demo || null,
          video_explanation_url: item.in_depth_youtube_exp || null
        }));
        
        setRawExercisesData(mappedData);
        return mappedData;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching raw exercise data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch raw exercise data.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getExerciseById = async (id: string): Promise<Exercise | null> => {
    setLoading(true);
    try {
      const exercise = await exerciseApi.getExerciseById(id);
      
      // Map API response to our Exercise interface for compatibility
      return mapExerciseResponse(exercise);
    } catch (error: any) {
      console.error("Error fetching exercise:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exercise details.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getExercisesByMuscleGroup = async (muscleGroup: string): Promise<Exercise[]> => {
    setLoading(true);
    try {
      const exercises = await exerciseApi.getExercisesByBodyPart(muscleGroup);
      
      // Map API response to our Exercise interface for compatibility
      return exercises.map(mapExerciseResponse);
    } catch (error: any) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exercises.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getExercisesByEquipment = async (equipment: string): Promise<Exercise[]> => {
    setLoading(true);
    try {
      const exercises = await exerciseApi.getExercisesByEquipment(equipment);
      
      // Map API response to our Exercise interface for compatibility
      return exercises.map(mapExerciseResponse);
    } catch (error: any) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exercises.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchExercises = async (query: string): Promise<Exercise[]> => {
    setLoading(true);
    try {
      // Try to search from our Supabase database first
      const { data: supabaseExercises, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
      
      if (supabaseExercises && supabaseExercises.length > 0) {
        console.log("Found exercises in Supabase:", supabaseExercises);
        return supabaseExercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          bodyPart: ex.muscle_group || '',
          target: ex.muscle_group || '',
          equipment: ex.equipment || '',
          muscle_group: ex.muscle_group,
          description: ex.description,
          difficulty: ex.difficulty as any,
          video_url: ex.video_url,
          image_url: ex.image_url
        }));
      }
      
      // If no results from Supabase, use the ExerciseDB API with our mock fallback
      try {
        const exercises = await exerciseApi.searchExercises(query);
        console.log("Search results:", exercises);
        return exercises.map(mapExerciseResponse);
      } catch (apiError) {
        console.error("Error searching exercises with external API:", apiError);
        // Return empty array if both Supabase and API searches fail
        return [];
      }
    } catch (error: any) {
      console.error("Error searching exercises:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to search exercises.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map API response to our Exercise interface
  const mapExerciseResponse = (exercise: any): Exercise => {
    return {
      id: exercise.id.toString(),
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      target: exercise.target,
      equipment: exercise.equipment,
      gifUrl: exercise.gifUrl,
      secondaryMuscles: exercise.secondaryMuscles,
      instructions: exercise.instructions,
      // Compatibility with our existing UI
      muscle_group: exercise.bodyPart,
      description: exercise.instructions ? exercise.instructions.join(' ') : '',
      difficulty: mapDifficulty(exercise),
      video_url: null,
      image_url: exercise.gifUrl || exercise.image_url
    };
  };

  // Map exercises to difficulty based on some heuristics
  const mapDifficulty = (exercise: any): string => {
    // This is a simplistic mapping - in real application you'd want more nuanced logic
    if (exercise.equipment === 'body weight' || exercise.equipment === 'assisted') {
      return 'Beginner';
    } else if (exercise.equipment === 'cable' || exercise.equipment === 'dumbbell') {
      return 'Intermediate';
    } else {
      return 'Advanced';
    }
  };

  return {
    isLoading: loading,
    rawExercisesData,
    getExerciseById,
    getExercisesByMuscleGroup,
    getExercisesByEquipment,
    searchExercises,
    getRawExercisesData,
    exercises,
    loading,
    error,
    page,
    setPage,
    itemsPerPage
  };
};
