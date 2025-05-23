
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Exercise, ExerciseFull } from '@/types/exercise';

interface UseSuggestedExercisesProps {
  muscleGroup?: string;
  equipment?: string;
  limit?: number;
}

export const useSuggestedExercises = ({ 
  muscleGroup = '', 
  equipment = '', 
  limit = 4 
}: UseSuggestedExercisesProps = {}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestedExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('exercises_full').select('*');
      
      if (muscleGroup) {
        query = query.eq('body_region', muscleGroup);
      }
      
      if (equipment) {
        query = query.eq('primary_equipment', equipment);
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) throw error;
      
      // Map the data to the Exercise type
      const mappedExercises: Exercise[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        bodyPart: item.body_region || '',
        target: item.prime_mover_muscle || '',
        image_url: item.youtube_thumbnail_url || '',
        equipment: item.primary_equipment || '',
        // Add a description field with a fallback
        description: item.long_description || item.short_description || '',
        difficulty: item.difficulty || '',
      }));
      
      setExercises(mappedExercises);
    } catch (err) {
      console.error('Error fetching suggested exercises:', err);
      setError('Failed to load suggested exercises');
    } finally {
      setIsLoading(false);
    }
  }, [muscleGroup, equipment, limit]);
  
  useEffect(() => {
    fetchSuggestedExercises();
  }, [fetchSuggestedExercises]);
  
  return { exercises, isLoading, error, refetch: fetchSuggestedExercises };
};
