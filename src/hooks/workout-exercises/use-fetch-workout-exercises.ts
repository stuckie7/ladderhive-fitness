
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFull } from '@/types/exercise';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: string | number;
  rest_time?: number;
  order_index: number;
  weight?: string;
  notes?: string;
}

export interface FetchWorkoutExercisesReturn {
  exercises: WorkoutExercise[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useFetchWorkoutExercises = (workoutId?: string): FetchWorkoutExercisesReturn => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercises = async () => {
    if (!workoutId) {
      setExercises([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all workout exercises with their associated exercise details
      const { data, error: fetchError } = await supabase
        .from('user_created_workout_exercises')
        .select(`
          *,
          exercises_full:exercise_id(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        setExercises([]);
        return;
      }

      // Transform the data to match our WorkoutExercise interface
      const formattedExercises: WorkoutExercise[] = data.map((ex) => {
        const exerciseData = ex.exercises_full ? {
          id: ex.exercise_id.toString(),
          name: ex.exercises_full?.name || 'Unknown Exercise',
          description: ex.exercises_full?.description || `${ex.exercises_full?.prime_mover_muscle || 'Muscle'} exercise`,
          muscle_group: ex.exercises_full?.prime_mover_muscle || '',
          equipment: ex.exercises_full?.primary_equipment || '',
          difficulty: ex.exercises_full?.difficulty || '',
          bodyPart: ex.exercises_full?.body_region || '',
          target: ex.exercises_full?.prime_mover_muscle || '',
          video_url: ex.exercises_full?.short_youtube_demo || '',
          video_demonstration_url: ex.exercises_full?.short_youtube_demo || '',
          video_explanation_url: ex.exercises_full?.in_depth_youtube_exp || '',
          image_url: ex.exercises_full?.youtube_thumbnail_url || '',
        } as Exercise : undefined;

        return {
          id: ex.id,
          workout_id: ex.workout_id,
          exercise_id: ex.exercise_id.toString(),
          exercise: exerciseData,
          sets: ex.sets,
          reps: ex.reps,
          rest_time: ex.rest_seconds,
          order_index: ex.order_index,
          weight: ex.notes, // Using notes field as weight since there's no dedicated weight field
          notes: ex.notes,
        };
      });

      setExercises(formattedExercises);
    } catch (err) {
      console.error('Error fetching workout exercises:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workout exercises'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [workoutId]);

  return { exercises, isLoading, error, refetch: fetchExercises };
};

// Handle prepared workout exercises separately
export const useFetchPreparedWorkoutExercises = (workoutId?: string): FetchWorkoutExercisesReturn => {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercises = async () => {
    if (!workoutId) {
      setExercises([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all workout exercises with their associated exercise details
      const { data, error: fetchError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercises_full:exercise_id(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        setExercises([]);
        return;
      }

      // Transform the data to match our WorkoutExercise interface
      const formattedExercises: WorkoutExercise[] = data.map((ex) => {
        const exerciseData = ex.exercises_full ? {
          id: ex.exercise_id.toString(),
          name: ex.exercises_full?.name || 'Unknown Exercise',
          description: ex.exercises_full?.description || `${ex.exercises_full?.prime_mover_muscle || 'Muscle'} exercise`,
          muscle_group: ex.exercises_full?.prime_mover_muscle || '',
          equipment: ex.exercises_full?.primary_equipment || '',
          difficulty: ex.exercises_full?.difficulty || '',
          bodyPart: ex.exercises_full?.body_region || '',
          target: ex.exercises_full?.prime_mover_muscle || '',
          video_url: ex.exercises_full?.short_youtube_demo || '',
          video_demonstration_url: ex.exercises_full?.short_youtube_demo || '',
          video_explanation_url: ex.exercises_full?.in_depth_youtube_exp || '',
          image_url: ex.exercises_full?.youtube_thumbnail_url || '',
        } as Exercise : undefined;

        return {
          id: ex.id,
          workout_id: ex.workout_id,
          exercise_id: ex.exercise_id.toString(),
          exercise: exerciseData,
          sets: ex.sets,
          reps: ex.reps,
          rest_time: ex.rest_seconds,
          order_index: ex.order_index,
          notes: ex.notes,
        };
      });

      setExercises(formattedExercises);
    } catch (err) {
      console.error('Error fetching prepared workout exercises:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workout exercises'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [workoutId]);

  return { exercises, isLoading, error, refetch: fetchExercises };
};
