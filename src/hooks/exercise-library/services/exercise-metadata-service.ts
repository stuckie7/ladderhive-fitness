
import { supabase } from '@/integrations/supabase/client';

export const getMuscleGroups = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .select('target_muscle_group')
      .not('target_muscle_group', 'is', null)
      .order('target_muscle_group');
    
    if (error) {
      console.error('Error fetching muscle groups:', error);
      throw error;
    }
    
    // Extract unique muscle groups
    const muscleGroups = [...new Set(data.map(item => item.target_muscle_group))].filter(Boolean) as string[];
    return muscleGroups;
  } catch (error) {
    console.error('Failed to fetch muscle groups:', error);
    return [];
  }
};

export const getEquipmentTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('exercises_full')
      .select('primary_equipment')
      .not('primary_equipment', 'is', null)
      .order('primary_equipment');
    
    if (error) {
      console.error('Error fetching equipment types:', error);
      throw error;
    }
    
    // Extract unique equipment types
    const equipmentTypes = [...new Set(data.map(item => item.primary_equipment))].filter(Boolean) as string[];
    return equipmentTypes;
  } catch (error) {
    console.error('Failed to fetch equipment types:', error);
    return [];
  }
};
