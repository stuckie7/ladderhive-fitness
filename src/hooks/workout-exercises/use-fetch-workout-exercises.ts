
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string | number;
  sets: number;
  reps: string | number;
  rest_seconds?: number;
  rest_time?: number;
  order_index: number;
  weight?: string;
  notes?: string;
  exercise?: {
    id: string | number;
    name: string;
    description?: string;
    prime_mover_muscle?: string;
    primary_equipment?: string;
    difficulty?: string;
    body_region?: string;
    short_youtube_demo?: string;
    in_depth_youtube_exp?: string;
    youtube_thumbnail_url?: string;
  };
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

  const fetchWorkoutExercises = useCallback(async () => {
    if (!workoutId) {
      setExercises([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, try to get exercises from user_created_workout_exercises
      const { data: userExercises, error: userExerciseError } = await supabase
        .from('user_created_workout_exercises')
        .select(`
          *,
          exercise:exercise_id (
            id, name, description, prime_mover_muscle, primary_equipment, 
            difficulty, body_region, short_youtube_demo, in_depth_youtube_exp,
            youtube_thumbnail_url
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });

      if (userExerciseError) {
        console.error('Error fetching user workout exercises:', userExerciseError);
        throw userExerciseError;
      }

      // If user exercises exist, format them and return
      if (userExercises && userExercises.length > 0) {
        const formattedExercises: WorkoutExercise[] = userExercises.map((ex) => {
          // Handle the case where exercise may be null
          const exerciseData = ex.exercise || {
            id: ex.exercise_id,
            name: 'Unknown Exercise',
            description: '',
            prime_mover_muscle: '',
            primary_equipment: '',
            difficulty: '',
            body_region: '',
            short_youtube_demo: '',
            in_depth_youtube_exp: '',
            youtube_thumbnail_url: ''
          };

          return {
            id: ex.id,
            workout_id: ex.workout_id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            order_index: ex.order_index,
            notes: ex.notes,
            exercise: exerciseData
          };
        });

        setExercises(formattedExercises);
        setIsLoading(false);
        return;
      }

      // If no user exercises, try getting from prepared workout exercises
      const { data: preparedExercises, error: preparedExerciseError } = await supabase
        .from('prepared_workout_exercises')
        .select(`
          *,
          exercise:exercise_id (
            id, name, description, prime_mover_muscle, primary_equipment, 
            difficulty, body_region, short_youtube_demo, in_depth_youtube_exp,
            youtube_thumbnail_url
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });

      if (preparedExerciseError) {
        console.error('Error fetching prepared workout exercises:', preparedExerciseError);
        throw preparedExerciseError;
      }

      // Format prepared exercises
      if (preparedExercises && preparedExercises.length > 0) {
        const formattedExercises: WorkoutExercise[] = preparedExercises.map((ex) => {
          // Handle the case where exercise may be null
          const exerciseData = ex.exercise || {
            id: ex.exercise_id,
            name: 'Unknown Exercise',
            description: '',
            prime_mover_muscle: '',
            primary_equipment: '',
            difficulty: '',
            body_region: '',
            short_youtube_demo: '',
            in_depth_youtube_exp: '',
            youtube_thumbnail_url: ''
          };

          // Convert exercise_id to string for compatibility
          return {
            id: ex.id,
            workout_id: ex.workout_id,
            exercise_id: ex.exercise_id.toString(),
            sets: ex.sets,
            reps: ex.reps || '',
            rest_seconds: ex.rest_seconds || 0,
            order_index: ex.order_index,
            notes: ex.notes,
            exercise: exerciseData
          };
        });

        setExercises(formattedExercises);
      } else {
        // No exercises found
        setExercises([]);
      }
    } catch (err: any) {
      console.error('Error fetching workout exercises:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workout exercises'));
    } finally {
      setIsLoading(false);
    }
  }, [workoutId]);

  // Re-export as refetch for more intuitive naming
  const refetch = fetchWorkoutExercises;

  // Return both the original and the exercises as 'workoutExercises' for compatibility
  return { exercises, isLoading, error, refetch };
};

// For backward compatibility
export const useWorkoutExercises = useFetchWorkoutExercises;
