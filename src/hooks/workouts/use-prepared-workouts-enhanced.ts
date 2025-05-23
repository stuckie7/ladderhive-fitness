
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { PreparedWorkout } from '@/types/workout';

export const usePreparedWorkoutsEnhanced = () => {
  const [workouts, setWorkouts] = useState<PreparedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('prepared_workouts')
        .select('id, title, description, duration_minutes, difficulty, category, goal, thumbnail_url')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setWorkouts(data as PreparedWorkout[]);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load workouts: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    isLoading,
    error,
    refetch: fetchWorkouts
  };
};
