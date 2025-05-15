
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { useToast } from '@/components/ui/use-toast';

export const useSuggestedExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuggestedExercises = useCallback(async (muscleGroup: string, limit = 4): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      // Query exercises based on muscle group
      const { data, error } = await supabase
        .from('exercises_full')
        .select('*')
        .or(`prime_mover_muscle.ilike.%${muscleGroup}%,target_muscle_group.ilike.%${muscleGroup}%`)
        .limit(limit);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Transform to Exercise type with proper property mappings
      const transformedExercises: Exercise[] = data.map(item => ({
        id: item.id,
        name: item.name || '',
        // Handle potentially missing description
        description: item.description || `${item.name} targeting ${item.prime_mover_muscle || muscleGroup}`,
        muscle_group: item.prime_mover_muscle || '',
        target: item.target_muscle_group || item.prime_mover_muscle || '',
        equipment: item.primary_equipment || '',
        difficulty: item.difficulty || '',
        bodyPart: item.body_region || '',
        video_url: item.short_youtube_demo || '',
        image_url: item.youtube_thumbnail_url || '',
        // Include additional properties
        prime_mover_muscle: item.prime_mover_muscle || '',
        primary_equipment: item.primary_equipment || '',
        youtube_thumbnail_url: item.youtube_thumbnail_url || ''
      }));
      
      setExercises(transformedExercises);
      return transformedExercises;
    } catch (error: any) {
      console.error('Error fetching suggested exercises:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suggested exercises.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    exercises,
    isLoading,
    fetchSuggestedExercises
  };
};
