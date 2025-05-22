
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWorkoutStats = () => {
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutStats = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          throw new Error('User not authenticated');
        }
        
        // Mock data for weekly chart for now
        const mockWeeklyData = [
          { day: 'Mon', workouts: 1, minutes: 30 },
          { day: 'Tue', workouts: 0, minutes: 0 },
          { day: 'Wed', workouts: 1, minutes: 45 },
          { day: 'Thu', workouts: 0, minutes: 0 },
          { day: 'Fri', workouts: 1, minutes: 35 },
          { day: 'Sat', workouts: 2, minutes: 90 },
          { day: 'Sun', workouts: 0, minutes: 0 }
        ];
        
        setWeeklyActivityData(mockWeeklyData);
      } catch (err: any) {
        console.error('Error fetching workout stats:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutStats();
  }, []);

  return { weeklyActivityData, isLoading, error };
};
