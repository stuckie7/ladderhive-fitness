import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Exercise } from '@/types/exercise';

interface AltWorkout {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration_minutes: number;
  exercises: {
    id: string;
    workout_id: string;
    exercise_id: string;
    exercise: Exercise;
    sets: number;
    reps: number;
    rest_time: number;
    order_index: number;
  }[];
}

export const useAltWorkouts = () => {
  const [workouts, setWorkouts] = useState<AltWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('prepared_workouts')
          .select(`
            *,
            exercises:prepared_workout_exercises(
              *,
              exercise:exercise_id(*, video_url, thumbnail_url)
            )
          `)
          .eq('type', 'alt') // Filter for ALT workouts
          .order('created_at', { ascending: false });

        if (error) throw error;

        setWorkouts(data || []);
      } catch (err: any) {
        console.error('Error fetching ALT workouts:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to load ALT workouts: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [toast]);

  return {
    workouts,
    isLoading,
    error,
  };
};
