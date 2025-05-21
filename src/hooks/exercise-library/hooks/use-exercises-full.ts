
import { useState, useEffect, useCallback } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { Exercise, ExerciseFull } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';

// This hook provides compatibility for ExerciseLibrarySimple and other components
export const useExercisesFull = () => {
  const { searchExercises, isLoading } = useExercises();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Initial load with empty search to get featured exercises
  useEffect(() => {
    const fetchInitialExercises = async () => {
      try {
        const results = await searchExercises('a'); // Search for 'a' to get some initial results
        setExercises(results || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load exercises'));
      }
    };
    
    fetchInitialExercises();
  }, [searchExercises]);

  // Add these methods needed by ExercisesFullList
  const fetchExercisesFull = useCallback(async (limit = 20, offset = 0): Promise<ExerciseFull[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Convert the id to string to match ExerciseFull type
      return (data || []).map(item => ({
        ...item,
        id: String(item.id)
      })) as ExerciseFull[];
      
    } catch (err) {
      console.error('Error fetching exercises:', err);
      return [];
    }
  }, []);

  const getMuscleGroups = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('prime_mover_muscle')
        .not('prime_mover_muscle', 'is', null);

      if (error) throw error;
      
      // Extract unique muscle groups
      const muscleGroups = Array.from(
        new Set(data.map(item => item.prime_mover_muscle).filter(Boolean))
      );
      
      return muscleGroups.sort();
    } catch (err) {
      console.error('Error fetching muscle groups:', err);
      return [];
    }
  }, []);

  const getEquipmentTypes = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('primary_equipment')
        .not('primary_equipment', 'is', null);

      if (error) throw error;
      
      // Extract unique equipment types
      const equipmentTypes = Array.from(
        new Set(data.map(item => item.primary_equipment).filter(Boolean))
      );
      
      return equipmentTypes.sort();
    } catch (err) {
      console.error('Error fetching equipment types:', err);
      return [];
    }
  }, []);

  const searchExercisesFull = useCallback(async (query: string): Promise<ExerciseFull[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      
      // Convert id to string
      return (data || []).map(item => ({
        ...item,
        id: String(item.id)
      })) as ExerciseFull[];
      
    } catch (err) {
      console.error('Error searching exercises:', err);
      return [];
    }
  }, []);

  return {
    exercises,
    loading: isLoading,
    error,
    page,
    setPage,
    itemsPerPage,
    searchExercises,
    fetchExercisesFull,
    getMuscleGroups,
    getEquipmentTypes,
    searchExercisesFull
  };
};
