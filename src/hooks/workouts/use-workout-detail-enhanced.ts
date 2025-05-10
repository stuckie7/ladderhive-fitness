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

  const transformWorkoutExercises = (exercisesData: any[]) => {
    if (!exercisesData || !Array.isArray(exercisesData)) return [];

    return exercisesData.map(item => {
      // Create a safe exercise object with fallback values
      const safeExercise = {
        id: item.exercise?.id || 0,
        name: item.exercise?.name || 'Unknown Exercise',
        // Only include these properties if they exist
        ...(item.exercise && 'description' in item.exercise ? { description: item.exercise.description } : {}),
        ...(item.exercise && 'video_demonstration_url' in item.exercise ? 
          { video_demonstration_url: item.exercise.video_demonstration_url } : {}),
        ...(item.exercise && 'short_youtube_demo' in item.exercise ? 
          { short_youtube_demo: item.exercise.short_youtube_demo } : {}),
        ...(item.exercise && 'youtube_thumbnail_url' in item.exercise ? 
          { youtube_thumbnail_url: item.exercise.youtube_thumbnail_url } : {}),
      };

      return {
        id: item.id,
        sets: item.sets,
        reps: item.reps,
        rest_seconds: item.rest_seconds || 0,
        notes: item.notes || '',
        order_index: item.order_index,
        exercise: safeExercise,
        modifications: item.modifications || ''
      };
    });
  };

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
      const transformedExercises = transformWorkoutExercises(exercisesData);

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
