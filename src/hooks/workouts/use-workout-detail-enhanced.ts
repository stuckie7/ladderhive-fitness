
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface DetailedWorkout {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  duration_minutes: number;
  thumbnail_url?: string;
  video_url?: string;
  long_description?: string;
  equipment_needed?: string;
  benefits?: string;
  instructions?: string;
  modifications?: string;
  category: string;
  goal: string;
  exercises: {
    id: string;
    sets: number;
    reps: string | number;
    rest_seconds?: number;
    notes?: string;
    order_index: number;
    exercise: {
      id: number | string;
      name: string;
      description?: string;
      video_demonstration_url?: string;
      short_youtube_demo?: string;
      youtube_thumbnail_url?: string;
    };
    modifications?: string;
  }[];
}

export const useWorkoutDetailEnhanced = (workoutId?: string) => {
  const [workout, setWorkout] = useState<DetailedWorkout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkoutDetail = useCallback(async () => {
    if (!workoutId) {
      setError("No workout ID provided");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) {
        throw new Error(workoutError.message);
      }

      if (!workoutData) {
        throw new Error("Workout not found");
      }

      // Fetch workout exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercises_full(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      const detailedWorkout: DetailedWorkout = {
        ...workoutData,
        exercises: exercisesData || []
      };

      setWorkout(detailedWorkout);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load workout: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [workoutId, toast]);

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetail();
    }
  }, [workoutId, fetchWorkoutDetail]);

  return {
    workout,
    isLoading,
    error,
    refetch: fetchWorkoutDetail
  };
};
