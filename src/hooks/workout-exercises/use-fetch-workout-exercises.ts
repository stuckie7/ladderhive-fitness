
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { WorkoutExercise } from './utils';

export interface FetchWorkoutExercisesReturn {
  workoutExercises: WorkoutExercise[];
  isLoading: boolean;
  error: string;
  fetchExercises: (workoutId: string) => Promise<void>;
}

export const useFetchWorkoutExercises = (): FetchWorkoutExercisesReturn => {
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExercises = useCallback(async (workoutId: string) => {
    if (!workoutId) {
      setError('No workout ID provided');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // First try to fetch from user_created_workout_exercises
      const { data: userWorkoutExercises, error: userError } = await supabase
        .from('user_created_workout_exercises')
        .select('*, exercises_full(*)')
        .eq('workout_id', workoutId)
        .order('order_index');

      if (userError) {
        throw userError;
      }

      // If user exercises exist, use them
      if (userWorkoutExercises && userWorkoutExercises.length > 0) {
        const mappedExercises: WorkoutExercise[] = userWorkoutExercises.map((ex) => {
          // Extract exercise data safely with null checks
          const exerciseData = ex.exercises_full ? {
            id: ex.exercises_full?.id?.toString() || '',
            name: ex.exercises_full?.name || 'Unknown Exercise',
            description: (ex.exercises_full as any)?.description || '',
            prime_mover_muscle: ex.exercises_full?.prime_mover_muscle || '',
            primary_equipment: ex.exercises_full?.primary_equipment || '',
            difficulty: ex.exercises_full?.difficulty || '',
            youtube_thumbnail_url: ex.exercises_full?.youtube_thumbnail_url || '',
            video_demonstration_url: (ex.exercises_full as any)?.video_demonstration_url || ex.exercises_full?.short_youtube_demo || ''
          } as Exercise : undefined;
          
          return {
            id: ex.id,
            workout_id: ex.workout_id,
            // Convert exercise_id to string to match WorkoutExercise type
            exercise_id: ex.exercise_id?.toString() || '',
            sets: ex.sets,
            reps: ex.reps,
            rest_time: ex.rest_seconds,
            rest_seconds: ex.rest_seconds,
            order_index: ex.order_index,
            weight: (ex as any).weight || undefined,
            notes: ex.notes || undefined,
            exercise: exerciseData
          } as WorkoutExercise;
        });

        setWorkoutExercises(mappedExercises);
      } else {
        // If not found in user exercises, check prepared workout exercises
        const { data: preparedExercises, error: preparedError } = await supabase
          .from('prepared_workout_exercises')
          .select('*, exercises_full(*)')
          .eq('workout_id', workoutId)
          .order('order_index');

        if (preparedError) {
          throw preparedError;
        }

        // Map the prepared exercises
        if (preparedExercises && preparedExercises.length > 0) {
          const mappedExercises: WorkoutExercise[] = preparedExercises.map((ex) => {
            // Extract exercise data safely with null checks
            const exerciseData = ex.exercises_full ? {
              id: ex.exercises_full?.id?.toString() || '',
              name: ex.exercises_full?.name || 'Unknown Exercise',
              description: (ex.exercises_full as any)?.description || '',
              prime_mover_muscle: ex.exercises_full?.prime_mover_muscle || '',
              primary_equipment: ex.exercises_full?.primary_equipment || '',
              difficulty: ex.exercises_full?.difficulty || '',
              youtube_thumbnail_url: ex.exercises_full?.youtube_thumbnail_url || '',
              video_demonstration_url: (ex.exercises_full as any)?.video_demonstration_url || ex.exercises_full?.short_youtube_demo || ''
            } as Exercise : undefined;
            
            return {
              id: ex.id,
              workout_id: ex.workout_id,
              // Convert exercise_id to string to match WorkoutExercise type
              exercise_id: ex.exercise_id?.toString() || '',
              sets: ex.sets,
              reps: ex.reps,
              rest_time: ex.rest_seconds,
              rest_seconds: ex.rest_seconds,
              order_index: ex.order_index,
              weight: undefined, // Adding this property to match WorkoutExercise interface
              notes: ex.notes || undefined,
              exercise: exerciseData
            } as WorkoutExercise;
          });

          setWorkoutExercises(mappedExercises);
        } else {
          setWorkoutExercises([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching workout exercises:', err);
      setError(err.message || 'Failed to fetch workout exercises');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Return the workout exercises data
  return {
    workoutExercises,
    isLoading,
    error,
    fetchExercises
  };
};

// For backward compatibility
export const useWorkoutExercises = useFetchWorkoutExercises;
