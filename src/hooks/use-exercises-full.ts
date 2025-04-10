
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseFull {
  id: number;
  name: string;
  difficulty: string | null;
  body_region: string | null;
  target_muscle_group: string | null;
  primary_equipment: string | null;
  secondary_equipment: string | null;
  prime_mover_muscle: string | null;
  secondary_muscle: string | null;
  tertiary_muscle: string | null;
  movement_pattern_1: string | null;
  plane_of_motion_1: string | null;
  mechanics: string | null;
  force_type: string | null;
  short_youtube_demo: string | null;
  in_depth_youtube_exp: string | null;
}

export const useExercisesFull = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchExercisesFull = async (limit = 20, offset = 0): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data as ExerciseFull[];
    } catch (error: any) {
      console.error('Error fetching exercises from exercises_full table:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch exercises data',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const searchExercisesFull = async (searchTerm: string, limit = 20): Promise<ExerciseFull[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as ExerciseFull[];
    } catch (error: any) {
      console.error('Error searching exercises:', error);
      toast({
        title: 'Error',
        description: 'Failed to search exercises',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getExerciseFullById = async (id: number): Promise<ExerciseFull | null> => {
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

      return data as ExerciseFull;
    } catch (error: any) {
      console.error('Error fetching exercise by ID:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch exercise details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getMuscleGroups = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('target_muscle_group')
        .not('target_muscle_group', 'is', null);

      if (error) {
        throw error;
      }

      // Extract unique muscle groups
      const muscleGroups = [...new Set(data.map(item => item.target_muscle_group))];
      return muscleGroups.filter((group): group is string => !!group);
    } catch (error: any) {
      console.error('Error fetching muscle groups:', error);
      return [];
    }
  };

  const getEquipmentTypes = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises_full')
        .select('primary_equipment')
        .not('primary_equipment', 'is', null);

      if (error) {
        throw error;
      }

      // Extract unique equipment types
      const equipmentTypes = [...new Set(data.map(item => item.primary_equipment))];
      return equipmentTypes.filter((equip): equip is string => !!equip);
    } catch (error: any) {
      console.error('Error fetching equipment types:', error);
      return [];
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
