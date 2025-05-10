
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
  short_description?: string; // Added missing property
  created_at?: string; // Added missing property
  updated_at?: string; // Added for completeness
  exercises: {
    id: string;
    sets: number;
    reps: string | number;
    rest_seconds?: number;
    notes?: string;
    modifications?: string;
    order_index: number;
    exercise: {
      id: number | string;
      name: string;
      description?: string;
      video_demonstration_url?: string;
      short_youtube_demo?: string;
      youtube_thumbnail_url?: string;
    };
  }[];
}

export const useWorkoutDetailEnhanced = (workoutId?: string) => {
  const [workout, setWorkout] = useState<DetailedWorkout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const transformWorkoutExercises = (exercisesData: any[], exerciseDetails: any[]) => {
    if (!exercisesData || !Array.isArray(exercisesData)) return [];

    return exercisesData.map(item => {
      // Find the matching exercise details for this exercise
      const exerciseDetail = exerciseDetails.find(detail => detail.id === item.exercise_id) || {};
      
      // Create a safe exercise object with all video and description fields
      const safeExercise = {
        id: exerciseDetail?.id || item.exercise_id,
        name: exerciseDetail?.name || 'Unknown Exercise',
        // We need to handle video and thumbnail fields carefully
        ...(exerciseDetail?.short_youtube_demo ? { short_youtube_demo: exerciseDetail.short_youtube_demo } : {}),
        ...(exerciseDetail?.youtube_thumbnail_url ? { youtube_thumbnail_url: exerciseDetail.youtube_thumbnail_url } : {}),
        ...(exerciseDetail?.video_demonstration_url ? { video_demonstration_url: exerciseDetail.video_demonstration_url } : {})
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
      console.log("Fetching workout with ID:", workoutId);
      
      // Fetch the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('prepared_workouts')
        .select(`
          id,
          title,
          description,
          short_description,
          difficulty,
          duration_minutes,
          category,
          goal,
          thumbnail_url,
          video_url,
          long_description,
          equipment_needed,
          benefits,
          instructions,
          modifications,
          created_at,
          updated_at
        `)
        .eq('id', workoutId)
        .single();

      if (workoutError) {
        throw new Error(workoutError.message);
      }

      if (!workoutData) {
        throw new Error("Workout not found");
      }

      console.log("Fetched workout data:", workoutData);

      // Fetch workout exercises separately
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
      
      // Use exercises_full table but select only the fields we need
      const { data: exercisesDetails, error: exerciseDetailsError } = await supabase
        .from('exercises_full')
        .select('id, name, short_youtube_demo, youtube_thumbnail_url, video_demonstration_url')
        .in('id', exerciseIds);

      if (exerciseDetailsError) {
        console.error("Exercise details fetch error:", exerciseDetailsError);
        throw new Error(exerciseDetailsError.message);
      }

      console.log('Fetched exercise details:', exercisesDetails);

      // Transform the exercises data by using our fetched exercise details
      const transformedExercises = transformWorkoutExercises(exercisesData, exercisesDetails);

      const detailedWorkout: DetailedWorkout = {
        ...workoutData,
        exercises: transformedExercises
      };

      setWorkout(detailedWorkout);
    } catch (err: any) {
      console.error("Error in fetchWorkoutDetail:", err);
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
