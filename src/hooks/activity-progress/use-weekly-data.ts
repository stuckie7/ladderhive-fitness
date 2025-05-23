
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ActivityData } from '@/types/activity';
import { getLastNDays, formatActivityData } from './utils';
import { format } from 'date-fns';

export const useWeeklyData = () => {
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWeeklyData = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        // In a real app, you might want to handle this case differently
        console.log('No user logged in, using demo data');
        return;
      }

      // Get date range for last 7 days
      const dates = getLastNDays(7);
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
        description: 'Failed to load your weekly progress data. Please try refreshing the page.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchWeeklyData();

    // Set up real-time subscription
    const channel = supabase
      .channel('daily_progress_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_progress',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Change received!', payload);
        fetchWeeklyData(); // Refresh data on any change
      })
      .subscribe();

    // Set up a refresh interval (e.g., every 5 minutes)
    const intervalId = setInterval(fetchWeeklyData, 300000);
    
    // Cleanup function
    return () => {
      channel.unsubscribe();
      clearInterval(intervalId);
    };
  }, [user]);

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
