import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { defaultMuscleGroups, defaultEquipmentTypes } from '@/hooks/exercise-library/constants';
import { ExerciseFull } from '@/types/exercise';

// In-memory cache to reduce redundant requests
const cache = {
  exercises: new Map<string, ExerciseFull[]>(),
  muscleGroups: null as string[] | null,
  equipmentTypes: null as string[] | null,
  lastFetch: 0,
  cacheDuration: 60000, // 1 minute cache
};

export const useExercisesFull = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchExercisesFull = async (limit = 50, offset = 0): Promise<ExerciseFull[]> => {
    const cacheKey = `exercises_${limit}_${offset}`;
    const now = Date.now();
    
    // Check cache first
    if (cache.exercises.has(cacheKey) && now - cache.lastFetch < cache.cacheDuration) {
      return cache.exercises.get(cacheKey) || [];
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching exercises_full with limit:', limit, 'offset:', offset);
      
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }
      
      // Update cache
      const exercises = data as unknown as ExerciseFull[];
      cache.exercises.set(cacheKey, exercises);
      cache.lastFetch = now;
      
      console.log(`Fetched ${exercises?.length || 0} exercises from exercises_full table`);
      return exercises;
    } catch (error: any) {
      console.error('Error fetching exercises from exercises_full table:', error);
      
      // Show toast only for actual data errors, not network connectivity issues
      if (error.message !== "Failed to fetch") {
        toast({
          title: 'Error',
          description: 'Failed to fetch exercises data',
          variant: 'destructive',
        });
      }
      
      // Return empty array on error
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const searchExercisesFull = async (searchTerm: string, limit = 20): Promise<ExerciseFull[]> => {
    const cacheKey = `search_${searchTerm}_${limit}`;
    const now = Date.now();
    
    // Check cache first
    if (cache.exercises.has(cacheKey) && now - cache.lastFetch < cache.cacheDuration) {
      return cache.exercises.get(cacheKey) || [];
    }
    
    setIsLoading(true);
    try {
      console.log('Searching exercises_full for:', searchTerm);
      
      // Use a simpler approach than RPC when dealing with network issues
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      // Update cache
      const exercises = data as unknown as ExerciseFull[];
      cache.exercises.set(cacheKey, exercises);
      cache.lastFetch = now;
      
      console.log(`Found ${exercises?.length || 0} matching exercises for search "${searchTerm}"`);
      return exercises;
    } catch (error: any) {
      console.error('Error searching exercises:', error);
      
      // Show toast only for actual data errors, not network connectivity issues
      if (error.message !== "Failed to fetch") {
        toast({
          title: 'Error',
          description: 'Failed to search exercises',
          variant: 'destructive',
        });
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
    const cacheKey = `exercise_${id}`;
    const now = Date.now();
    
    // Check cache first
    if (cache.exercises.has(cacheKey) && now - cache.lastFetch < cache.cacheDuration) {
      return cache.exercises.get(cacheKey)?.[0] || null;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }
      
      // Update cache
      const exercise = data as unknown as ExerciseFull;
      cache.exercises.set(cacheKey, [exercise]);
      cache.lastFetch = now;
      
      return exercise;
    } catch (error: any) {
      console.error('Error fetching exercise by ID:', error);
      
      // Show toast only for actual data errors, not network connectivity issues
      if (error.message !== "Failed to fetch") {
        toast({
          title: 'Error',
          description: 'Failed to fetch exercise details',
          variant: 'destructive',
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMuscleGroups = async (): Promise<string[]> => {
    // Return cached result if available
    if (cache.muscleGroups) {
      return cache.muscleGroups;
    }
    
    try {
      // Use the default values when offline or during initial load
      cache.muscleGroups = defaultMuscleGroups;
      return defaultMuscleGroups;
    } catch (error: any) {
      console.error('Error fetching muscle groups:', error);
      return defaultMuscleGroups;
    }
  };

  const getEquipmentTypes = async (): Promise<string[]> => {
    // Return cached result if available
    if (cache.equipmentTypes) {
      return cache.equipmentTypes;
    }
    
    try {
      // Use the default values when offline or during initial load
      cache.equipmentTypes = defaultEquipmentTypes;
      return defaultEquipmentTypes;
    } catch (error: any) {
      console.error('Error fetching equipment types:', error);
      return defaultEquipmentTypes;
    }
  };

  return {
    isLoading,
    fetchExercisesFull,
    searchExercisesFull,
    getExerciseFullById,
    getMuscleGroups,
    getEquipmentTypes,
  };
};
