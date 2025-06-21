
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
    const fetchRecommendedWorkouts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // For now, we fetch a few workouts as "recommendations".
        // A real implementation would use a more sophisticated recommendation engine.
        const { data, error } = await supabase
          .from('suggested_workouts')
          .select('id, name, duration, difficulty')
          .limit(5);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedWorkouts: UpcomingWorkout[] = data.map(workout => ({
            id: workout.id,
            title: workout.name,
            scheduled_date: '', // This is a recommendation, not scheduled yet.
            duration_minutes: workout.duration,
            difficulty: workout.difficulty,
          }));
          setWorkouts(formattedWorkouts);
        }
      } catch (err: any) {
        console.error('Error fetching recommended workouts:', err);
        setError(err.message || 'Failed to load recommendations.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedWorkouts();
  }, [user]);

  return { workouts, isLoading, error };
};
