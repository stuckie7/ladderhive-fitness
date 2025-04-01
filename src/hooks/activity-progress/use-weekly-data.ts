
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ActivityData } from '@/types/activity';

export const useWeeklyData = () => {
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchWeeklyData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get date range for last 7 days
      const today = new Date();
      const dates = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Format the date strings for the query
      const startDate = dates[0];
      const endDate = dates[6];

      // Fetch the data from Supabase
      const { data, error } = await supabase
        .from('daily_progress')
        .select('date, step_count, active_minutes, workouts_completed')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Create a map of the fetched data
      const dataMap = new Map<string, ActivityData>();
      data.forEach(item => {
        dataMap.set(item.date, {
          date: item.date,
          steps: item.step_count,
          active_minutes: item.active_minutes,
          workouts: item.workouts_completed,
          day: '' // Will be set below
        });
      });

      // Ensure we have entries for all days in the week
      const formattedData = dates.map(date => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayIndex = new Date(date).getDay();
        const day = dayNames[dayIndex];
        
        if (dataMap.has(date)) {
          const entry = dataMap.get(date)!;
          return {
            ...entry,
            day,
          };
        }
        
        // Return a zero-value entry if we don't have data for this day
        return {
          date,
          day,
          steps: 0,
          active_minutes: 0,
          workouts: 0
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
