
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ActivityData } from '@/types/activity';
import { getLastNDays, formatActivityData } from './utils';

export const useWeeklyData = () => {
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchWeeklyData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user]);

  return {
    weeklyData,
    isLoading,
    refreshData: fetchWeeklyData
  };
};
