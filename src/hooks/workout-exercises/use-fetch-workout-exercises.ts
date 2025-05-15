
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWorkoutExercises = (workoutId: string) => {
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!workoutId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First try to fetch from user_created_workout_exercises
        let { data: userExercises, error: userError } = await supabase
          .from('user_created_workout_exercises')
          .select('*, exercise_id')
          .eq('workout_id', workoutId)
          .order('order_index');

        if (!userError && userExercises && userExercises.length > 0) {
          // Fetch exercise details for each exercise
          const enrichedExercises = await Promise.all(
            userExercises.map(async (ex) => {
              const { data: exerciseData } = await supabase
                .from('exercises_full')
                .select('*')
                .eq('id', ex.exercise_id)
                .single();
                
              return {
                ...ex,
                exercise: exerciseData
              };
            })
          );
          
          setWorkoutExercises(enrichedExercises);
          setIsLoading(false);
          return;
        }

        // If no user exercises found, try prepared_workout_exercises
        let { data: preparedExercises, error: preparedError } = await supabase
          .from('prepared_workout_exercises')
          .select('*, exercise_id')
          .eq('workout_id', workoutId)
          .order('order_index');

        if (!preparedError && preparedExercises && preparedExercises.length > 0) {
          // Fetch exercise details for each exercise
          const enrichedExercises = await Promise.all(
            preparedExercises.map(async (ex) => {
              const { data: exerciseData } = await supabase
                .from('exercises_full')
                .select('*')
                .eq('id', ex.exercise_id)
                .single();
                
              return {
                ...ex,
                exercise: exerciseData
              };
            })
          );
          
          setWorkoutExercises(enrichedExercises);
        }
      } catch (err: any) {
        console.error('Error fetching workout exercises:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [workoutId]);

  return {
    workoutExercises,
    isLoading,
    error,
    setWorkoutExercises
  };
};
