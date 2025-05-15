
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { WorkoutExercise, ensureStringReps } from './utils';

export interface FetchWorkoutExercisesReturn {
  workoutExercises: WorkoutExercise[];
  isLoading: boolean;
  error: string;
  fetchExercises: (workoutId: string) => Promise<void>;
  exercises: WorkoutExercise[]; // Adding alias for backward compatibility
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
        const mappedExercises = userWorkoutExercises.map((ex) => {
          // Create exercise object only if exercises_full exists and has data
          let exerciseObj: Exercise | undefined = undefined;
          
          if (ex.exercises_full && typeof ex.exercises_full === 'object' && 'id' in ex.exercises_full) {
            exerciseObj = {
              id: ex.exercises_full.id.toString(),
              name: ex.exercises_full.name || '',
              description: ex.exercises_full.description || "",
              prime_mover_muscle: ex.exercises_full.prime_mover_muscle,
              primary_equipment: ex.exercises_full.primary_equipment,
              difficulty: ex.exercises_full.difficulty,
              youtube_thumbnail_url: ex.exercises_full.youtube_thumbnail_url,
              video_demonstration_url: ex.exercises_full.video_demonstration_url || ex.exercises_full.short_youtube_demo
            } as Exercise;
          }
          
          return {
            id: ex.id,
            workout_id: ex.workout_id,
            exercise_id: ex.exercise_id.toString(), // Convert to string to match type
            sets: ex.sets,
            reps: ensureStringReps(ex.reps),
            rest_time: ex.rest_seconds,
            rest_seconds: ex.rest_seconds,
            order_index: ex.order_index,
            weight: ex.weight || undefined,
            notes: ex.notes || undefined,
            exercise: exerciseObj
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
          const mappedExercises = preparedExercises.map((ex) => {
            // Create exercise object only if exercises_full exists and has data
            let exerciseObj: Exercise | undefined = undefined;
            
            if (ex.exercises_full && typeof ex.exercises_full === 'object' && 'id' in ex.exercises_full) {
              exerciseObj = {
                id: ex.exercises_full.id.toString(),
                name: ex.exercises_full.name || '',
                description: ex.exercises_full.description || "",
                prime_mover_muscle: ex.exercises_full.prime_mover_muscle,
                primary_equipment: ex.exercises_full.primary_equipment,
                difficulty: ex.exercises_full.difficulty,
                youtube_thumbnail_url: ex.exercises_full.youtube_thumbnail_url,
                video_demonstration_url: ex.exercises_full.video_demonstration_url || ex.exercises_full.short_youtube_demo
              } as Exercise;
            }
            
            return {
              id: ex.id,
              workout_id: ex.workout_id,
              exercise_id: ex.exercise_id.toString(), // Convert to string to match type
              sets: ex.sets,
              reps: ensureStringReps(ex.reps),
              rest_time: ex.rest_seconds,
              rest_seconds: ex.rest_seconds,
              order_index: ex.order_index,
              weight: undefined, // Add weight property with undefined
              notes: ex.notes || undefined,
              exercise: exerciseObj
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

  // Return the workoutExercises data
  return {
    workoutExercises,
    isLoading,
    error,
    fetchExercises,
    exercises: workoutExercises // Add the alias for backward compatibility
  };
};

// For backward compatibility
export const useWorkoutExercises = useFetchWorkoutExercises;
