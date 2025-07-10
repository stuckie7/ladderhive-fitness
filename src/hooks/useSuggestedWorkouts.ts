import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSuggestedWorkouts, addWorkoutToSchedule } from '@/services/suggestedWorkoutService';
import { SuggestedWorkout } from '@/services/suggestedWorkoutService';

export const useSuggestedWorkouts = (limit: number = 5) => {
  const { user } = useAuth();
  const [suggestedWorkouts, setSuggestedWorkouts] = useState<SuggestedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuggestedWorkouts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const workouts = await getSuggestedWorkouts(user.id, limit);
      setSuggestedWorkouts(workouts);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch suggested workouts:', err);
      setError(err instanceof Error ? err : new Error('Failed to load suggested workouts'));
    } finally {
      setLoading(false);
    }
  };

  const scheduleWorkout = async (workoutId: string, scheduledDate: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await addWorkoutToSchedule(user.id, workoutId, scheduledDate);
      // Refresh the suggestions after scheduling
      await fetchSuggestedWorkouts();
      return { success: true };
    } catch (err) {
      console.error('Failed to schedule workout:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSuggestedWorkouts();
  }, [user?.id]);

  return {
    suggestedWorkouts,
    loading,
    error,
    refresh: fetchSuggestedWorkouts,
    scheduleWorkout,
  };
};
