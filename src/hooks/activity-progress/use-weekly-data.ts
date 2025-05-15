
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ActivityData } from '@/types/activity';
import { getLastNDays, formatActivityData } from './utils';

export const useWeeklyData = () => {
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWeeklyData = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, generate mock data if no user is logged in
      if (!user) {
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
      
      // Format the date strings for the query
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      // Fetch the data from Supabase
      const { data, error } = await supabase
        .from('daily_progress')
        .select('date, step_count, active_minutes, workouts_completed')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Format the data with our utility function
      const formattedData = formatActivityData(data, dates);
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
    // Set up a refresh interval (e.g., every 5 minutes)
    const intervalId = setInterval(fetchWeeklyData, 300000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  return {
    weeklyData,
    isLoading,
    refreshData: fetchWeeklyData
  };
};
