
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

      // Fetch workout exercises separately without the join due to the error
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('prepared_workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('order_index');

      if (exercisesError) {
        console.error("Exercise fetch error:", exercisesError);
        throw new Error(exercisesError.message);
      }

      // Fetch all exercises data separately
      const exerciseIds = exercisesData.map(item => item.exercise_id);
      const { data: exercisesDetails, error: exerciseDetailsError } = await supabase
        .from('exercises_full')
        .select('*')
        .in('id', exerciseIds);

      if (exerciseDetailsError) {
        console.error("Exercise details fetch error:", exerciseDetailsError);
        throw new Error(exerciseDetailsError.message);
      }

      // Transform the exercises data by manually joining with exercise details
      const transformedExercises = exercisesData.map(item => {
        // Find the corresponding exercise details
        const exerciseInfo = exercisesDetails?.find(ex => ex.id === item.exercise_id) || {
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
          exercise: {
            id: exerciseInfo.id,
            name: exerciseInfo.name || "Unknown Exercise",
            description: exerciseInfo.description || "",
            video_demonstration_url: exerciseInfo.video_demonstration_url,
            short_youtube_demo: exerciseInfo.short_youtube_demo,
            youtube_thumbnail_url: exerciseInfo.youtube_thumbnail_url
          },
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
