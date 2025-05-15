
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ExerciseFull } from '@/types/exercise';

export const useSuggestedExercises = (limit = 5) => {
  const [exercises, setExercises] = useState<ExerciseFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestedExercises = async () => {
      try {
        setIsLoading(true);
        
        // Fetch random exercises that have video demonstrations
        const { data, error } = await supabase
          .from('exercises_full')
          .select('*')
          .not('short_youtube_demo', 'is', null)
          .limit(limit);
        
        if (error) throw error;
        
        // Map the response to include all ExerciseFull properties
        const mappedExercises: ExerciseFull[] = (data || []).map(exercise => ({
          ...exercise,
          target_muscle_group: exercise.prime_mover_muscle,
          video_demonstration_url: exercise.short_youtube_demo,
          video_explanation_url: exercise.in_depth_youtube_exp,
          description: exercise.exercise_classification // Use as placeholder for description
        }));
        
        setExercises(mappedExercises);
        
      } catch (err: any) {
        console.error('Error fetching suggested exercises:', err);
        toast({
          title: "Error",
          description: `Failed to load suggested exercises`,
          variant: "destructive",
        });
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestedExercises();
  }, [limit, toast]);

  return { exercises, isLoading };
};
