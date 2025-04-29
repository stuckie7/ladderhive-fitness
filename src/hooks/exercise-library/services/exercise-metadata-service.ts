
import { supabase } from '@/integrations/supabase/client';

export const getMuscleGroups = async (): Promise<string[]> => {
  try {
    console.log('Fetching unique muscle groups');
    
    // Query for unique target muscle groups
    const { data: targetMuscles, error: targetError } = await supabase
      .from('exercises_full')
      .select('target_muscle_group')
      .not('target_muscle_group', 'is', null)
      .order('target_muscle_group');
    
    if (targetError) {
      console.error('Error fetching muscle groups:', targetError);
      throw targetError;
    }
    
    // Extract unique muscle groups and filter out any nulls
    const muscleGroups = [...new Set(
      targetMuscles
        .map(item => item.target_muscle_group)
        .filter(Boolean)
    )];
    
    console.log(`Found ${muscleGroups.length} unique muscle groups`);
    return muscleGroups;
  } catch (error) {
    console.error('Failed to fetch muscle groups:', error);
    return [];
  }
};

export const getEquipmentTypes = async (): Promise<string[]> => {
  try {
    console.log('Fetching unique equipment types');
    
    // Query for unique primary equipment types
    const { data: primaryEquipment, error: equipError } = await supabase
      .from('exercises_full')
      .select('primary_equipment')
      .not('primary_equipment', 'is', null)
      .order('primary_equipment');
    
    if (equipError) {
      console.error('Error fetching equipment types:', equipError);
      throw equipError;
    }
    
    // Extract unique equipment types and filter out any nulls
    const equipmentTypes = [...new Set(
      primaryEquipment
        .map(item => item.primary_equipment)
        .filter(Boolean)
    )];
    
    console.log(`Found ${equipmentTypes.length} unique equipment types`);
    return equipmentTypes;
  } catch (error) {
    console.error('Failed to fetch equipment types:', error);
    return [];
  }
};
