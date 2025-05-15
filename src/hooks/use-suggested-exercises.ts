
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';

interface UseSuggestedExercisesReturn {
  suggestedExercises: Exercise[];
  isLoading: boolean;
  fetchSuggestedExercises: (muscleGroup?: string, limit?: number) => Promise<Exercise[]>;
}

export const useSuggestedExercises = (): UseSuggestedExercisesReturn => {
  const [suggestedExercises, setSuggestedExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestedExercises = async (muscleGroup?: string, limit = 4): Promise<Exercise[]> => {
    setIsLoading(true);
    
    try {
      // Create a query builder
      let query = supabase
        .from('exercises_full')
        .select('*');
      
      // Add filter for muscle group if provided
      if (muscleGroup) {
        query = query.like('prime_mover_muscle', `%${muscleGroup}%`);
      }
      
      // Get exercises with limit
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;

      // Map the data to the Exercise type with fallbacks for missing properties
      const exercises = (data || []).map(item => ({
        id: item.id,
        name: item.name || 'Unknown Exercise',
        description: (item as any).description || '',
        muscle_group: item.prime_mover_muscle || '',
        equipment: item.primary_equipment || 'Bodyweight',
        difficulty: item.difficulty || 'Beginner',
        target_muscle_group: (item as any).target_muscle_group || item.prime_mover_muscle || '',
        prime_mover_muscle: item.prime_mover_muscle || '',
        primary_equipment: item.primary_equipment || '',
        youtube_thumbnail_url: item.youtube_thumbnail_url || '',
        video_demonstration_url: (item as any).video_demonstration_url || item.short_youtube_demo || '',
        bodyPart: item.body_region || ''
      } as Exercise));
      
      setSuggestedExercises(exercises);
      setIsLoading(false);
      return exercises;
    } catch (error) {
      console.error('Error fetching suggested exercises:', error);
      setIsLoading(false);
      return [];
    }
  };

  // Fetch exercises when component mounts
  useEffect(() => {
    fetchSuggestedExercises();
  }, []);

  return { 
    suggestedExercises, 
    isLoading,
    fetchSuggestedExercises
  };
};
