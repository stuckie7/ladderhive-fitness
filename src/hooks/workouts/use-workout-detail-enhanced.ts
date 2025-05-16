
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useWorkoutDetailEnhanced = (id?: string) => {
  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchWorkout = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('prepared_workouts')
          .select(`
            *,
            exercises:prepared_workout_exercises(
              *,
              exercise:exercise_id(*)
            )
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setWorkout(data);
        
      } catch (err: any) {
        console.error('Error fetching workout detail:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to load workout: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [id, toast]);

  return { workout, isLoading, error };
};
