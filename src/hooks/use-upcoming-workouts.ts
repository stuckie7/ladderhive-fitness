
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UpcomingWorkout {
  id: string;
  title: string;
  scheduled_date: string;
  duration_minutes: number;
  difficulty: string;
}

export const useUpcomingWorkouts = () => {
  const [workouts, setWorkouts] = useState<UpcomingWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUpcomingWorkouts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Query to get upcoming scheduled workouts
        // Adjust the query to properly access the joined table fields
        const { data, error } = await supabase
          .from('user_workouts')
          .select(`
            id,
            planned_for,
            workout_id (
              id,
              title,
              duration_minutes,
              difficulty
            )
          `)
          .eq('user_id', user.id)
          .gt('planned_for', new Date().toISOString())
          .is('completed_at', null)
          .order('planned_for', { ascending: true })
          .limit(3);

        if (error) {
          throw new Error(error.message);
        }

        // Format the data safely with type checking
        const formattedWorkouts: UpcomingWorkout[] = (data || [])
          .filter(workout => workout.workout_id) // Filter out entries without workout data
          .map(workout => {
            // Ensure workout_id is an object before accessing its properties
            const workoutInfo = workout.workout_id as Record<string, any> || {};
            
            return {
              id: workout.id,
              title: workoutInfo.title || 'Scheduled Workout',
              scheduled_date: workout.planned_for,
              duration_minutes: workoutInfo.duration_minutes || 30,
              difficulty: workoutInfo.difficulty || 'Intermediate'
            };
          });

        setWorkouts(formattedWorkouts);
      } catch (err) {
        console.error('Error fetching upcoming workouts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load upcoming workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingWorkouts();
  }, [user]);

  return { workouts, isLoading, error };
};
