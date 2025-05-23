
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

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

        // Corrected query to properly join and select fields from the proper tables
        const { data, error } = await supabase
          .from('user_workouts')
          .select(`
            id,
            planned_for,
            workout_id,
            prepared_workouts (
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

        // Format the data safely with type checking and fallbacks
        const formattedWorkouts: UpcomingWorkout[] = (data || [])
          .filter(workout => workout.prepared_workouts) // Filter out entries without workout data
          .map(workout => {
            // Type the workoutInfo properly to avoid "Property does not exist on type '{}'" errors
            const workoutInfo = workout.prepared_workouts as Record<string, any> || {};
            
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
