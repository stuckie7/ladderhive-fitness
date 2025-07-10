
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Workout {
  id: string;
  date: string;
  workout_name: string;
  duration_minutes: number;
  calories_burned?: number;
}

export const useRecentWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch recent workouts
        const { data, error } = await supabase
          .from('workout_history')
          .select('id, date, workout_name, duration_minutes, calories_burned')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (error) {
          throw new Error(error.message);
        }

        setWorkouts(data || []);
      } catch (err) {
        console.error('Error fetching recent workouts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recent workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentWorkouts();
  }, [user]);

  return { workouts, isLoading, error };
};
