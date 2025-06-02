
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

        // Query for upcoming workouts using the correct table names and relationships
        const { data, error } = await supabase
          .from('workout_schedules')
          .select(`
            id,
            scheduled_date,
            status,
            suggested_workouts (
              id,
              name,
              duration,
              difficulty
            )
          `)
          .eq('user_id', user.id)
          .gt('scheduled_date', new Date().toISOString())
          .eq('status', 'scheduled')
          .order('scheduled_date', { ascending: true })
          .limit(3);

        if (error) {
          throw new Error(error.message);
        }

        // Format the data safely with type checking and fallbacks
        const formattedWorkouts: UpcomingWorkout[] = (data || [])
          .filter(workout => workout.suggested_workouts) // Filter out entries without workout data
          .map(workout => {
            const workoutInfo = workout.suggested_workouts as Record<string, any> || {};
            
            return {
              id: workout.id,
              title: workoutInfo.name || 'Scheduled Workout',
              scheduled_date: workout.scheduled_date,
              duration_minutes: workoutInfo.duration || 30,
              difficulty: workoutInfo.difficulty || 'intermediate'
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
