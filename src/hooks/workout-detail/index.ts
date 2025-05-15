
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutDetail } from '@/types/workout';
import { useToast } from '@/hooks/use-toast';

export const useWorkoutDetail = (workoutId: string) => {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch from user_created_workouts first
        let { data: userWorkout, error: userWorkoutError } = await supabase
          .from('user_created_workouts')
          .select('*')
          .eq('id', workoutId)
          .single();

        if (!userWorkoutError && userWorkout) {
          // Format user workout to match the WorkoutDetail interface
          setWorkout({
            id: userWorkout.id,
            title: userWorkout.title,
            description: userWorkout.description || '',
            duration: userWorkout.duration_minutes,
            exercises: 0, // Will be updated after fetching exercises
            difficulty: userWorkout.difficulty,
            category: userWorkout.category,
            date: new Date(userWorkout.created_at).toLocaleDateString()
          });

          // Fetch exercises for this workout
          const { data: exercises, error: exercisesError } = await supabase
            .from('user_created_workout_exercises')
            .select('*')
            .eq('workout_id', workoutId);

          if (!exercisesError && exercises) {
            setWorkout(prev => ({
              ...prev!,
              exercises: exercises.length
            }));
          }
          
          return;
        }

        // If not found in user workouts, try prepared workouts
        const { data: preparedWorkout, error: preparedWorkoutError } = await supabase
          .from('prepared_workouts')
          .select('*')
          .eq('id', workoutId)
          .single();

        if (!preparedWorkoutError && preparedWorkout) {
          // Format prepared workout to match the WorkoutDetail interface
          setWorkout({
            id: preparedWorkout.id,
            title: preparedWorkout.title,
            description: preparedWorkout.description || '',
            duration: preparedWorkout.duration_minutes,
            exercises: 0, // Will be updated after fetching exercises
            difficulty: preparedWorkout.difficulty,
            category: preparedWorkout.category,
            date: new Date(preparedWorkout.created_at).toLocaleDateString()
          });

          // Fetch exercises for this workout
          const { data: exercises, error: exercisesError } = await supabase
            .from('prepared_workout_exercises')
            .select('*')
            .eq('workout_id', workoutId);

          if (!exercisesError && exercises) {
            setWorkout(prev => ({
              ...prev!,
              exercises: exercises.length
            }));
          }
          
          return;
        }

        // If not found in both tables, throw an error
        throw new Error('Workout not found');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch workout details');
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch workout details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId, toast]);

  return {
    workout,
    isLoading,
    error
  };
};
