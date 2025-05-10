
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

      // Fetch workout exercises with a proper join
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          id, sets, reps, rest_seconds, notes, order_index, exercise_id,
          exercise:exercises_full(id, name, description, short_youtube_demo, video_demonstration_url, youtube_thumbnail_url)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (exercisesError) {
        console.error("Exercise fetch error:", exercisesError);
        throw new Error(exercisesError.message);
      }

      // Transform the nested exercise data to the format we need
      const transformedExercises = exercisesData.map(item => {
        // Provide a fallback for the exercise object
        const exerciseInfo = item.exercise || {
          id: item.exercise_id,
          name: "Unknown Exercise",
          description: "Details not available"
        };
        
        return {
          id: item.id,
          sets: item.sets,
          reps: item.reps,
          rest_seconds: item.rest_seconds,
          notes: item.notes,
          order_index: item.order_index,
          exercise: exerciseInfo,
          modifications: ""
        };
      });

      const detailedWorkout: DetailedWorkout = {
        ...workoutData,
        exercises: transformedExercises
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
