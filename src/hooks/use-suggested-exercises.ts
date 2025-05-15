
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
        
        setExercises(data || []);
        
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
