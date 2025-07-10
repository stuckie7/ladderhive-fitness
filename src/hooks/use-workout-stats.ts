
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface ActivityDataPoint {
  date: string;
  count: number;
  minutes?: number;
  calories?: number;
}

export const useWorkoutStats = () => {
  const [weeklyActivityData, setWeeklyActivityData] = useState<ActivityDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkoutStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);

        // Format dates for query
        const startDate = sevenDaysAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        // Fetch workouts for last 7 days
        const { data, error } = await supabase
          .from('workout_history')
          .select('date, duration_minutes')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        // Create array of last 7 days
        const activityData: ActivityDataPoint[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(sevenDaysAgo);
          date.setDate(sevenDaysAgo.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Find workouts for this day
          const dayWorkouts = data?.filter(w => w.date === dateStr) || [];
          const count = dayWorkouts.length;
          const minutes = dayWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
          
          activityData.push({
            date: dateStr,
            count,
            minutes
          });
        }

        setWeeklyActivityData(activityData);
      } catch (err) {
        console.error('Error fetching workout stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load workout statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutStats();
  }, [user]);

  return { weeklyActivityData, isLoading, error };
};
