
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ActivityData } from '@/types/activity';
import { format, subDays } from 'date-fns';

const getLastNDays = (n: number): string[] => {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    dates.push(format(date, 'yyyy-MM-dd'));
  }
  return dates;
};

export const useWeeklyData = () => {
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWeeklyData = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        // Generate mock data for demo purposes
        const dates = getLastNDays(7);
        const mockData = dates.map(date => ({
          date,
          day: format(new Date(date), 'E'),
          steps: Math.floor(Math.random() * 10000) + 2000,
          active_minutes: Math.floor(Math.random() * 60) + 15,
          workouts: Math.random() > 0.6 ? 1 : 0
        }));
        setWeeklyData(mockData);
        return;
      }

      // Get date range for last 7 days
      const dates = getLastNDays(7);
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      // Fetch daily progress data for the last 7 days
      const { data: dailyProgressData, error: progressError } = await supabase
        .from('daily_progress')
        .select('date, step_count, active_minutes, workouts_completed')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      // Also fetch workout history to get actual workout counts
      const { data: workoutHistoryData, error: historyError } = await supabase
        .from('workout_history')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (progressError) {
        console.error('Error fetching daily progress:', progressError);
      }
      
      if (historyError) {
        console.error('Error fetching workout history:', historyError);
      }

      // Create a map of workout counts by date
      const workoutCountsByDate: { [key: string]: number } = {};
      if (workoutHistoryData) {
        workoutHistoryData.forEach(workout => {
          const date = workout.date;
          workoutCountsByDate[date] = (workoutCountsByDate[date] || 0) + 1;
        });
      }

      // Format the data for the chart
      const formattedData: ActivityData[] = dates.map(date => {
        const progressEntry = dailyProgressData?.find(entry => entry.date === date);
        const workoutCount = workoutCountsByDate[date] || 0;
        
        return {
          date,
          day: format(new Date(date), 'E'),
          steps: progressEntry?.step_count || 0,
          active_minutes: progressEntry?.active_minutes || 0,
          workouts: workoutCount
        };
      });

      setWeeklyData(formattedData);
    } catch (error: any) {
      console.error('Error fetching weekly progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your weekly progress data.',
        variant: 'destructive',
      });
      
      // Fallback to demo data in case of error
      const dates = getLastNDays(7);
      const mockData = dates.map(date => ({
        date,
        day: format(new Date(date), 'E'),
        steps: Math.floor(Math.random() * 10000) + 2000,
        active_minutes: Math.floor(Math.random() * 60) + 15,
        workouts: Math.random() > 0.6 ? 1 : 0
      }));
      setWeeklyData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  return {
    weeklyData,
    isLoading,
    refreshData: fetchWeeklyData
  };
};
