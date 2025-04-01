
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ActivityData {
  date: string;
  steps: number;
  active_minutes: number;
  workouts: number;
}

export interface MonthlySummary {
  totalSteps: number;
  avgStepsPerDay: number;
  totalActiveMinutes: number;
  avgActiveMinutesPerDay: number;
  totalWorkouts: number;
  avgWorkoutsPerWeek: number;
  completionRate: number;
  mostActiveDay: {
    name: string;
    steps: number;
  };
}

export const useActivityProgress = () => {
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
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
          workouts: item.workouts_completed
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
      calculateMonthlySummary();
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

  const calculateMonthlySummary = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      // Fetch the month's data
      const { data, error } = await supabase
        .from('daily_progress')
        .select('date, step_count, step_goal, active_minutes, active_minutes_goal, workouts_completed, workouts_goal')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      if (!data.length) {
        return; // No data for this month
      }

      // Calculate total steps, active minutes, and workouts
      const totalSteps = data.reduce((sum, day) => sum + day.step_count, 0);
      const totalActiveMinutes = data.reduce((sum, day) => sum + day.active_minutes, 0);
      const totalWorkouts = data.reduce((sum, day) => sum + day.workouts_completed, 0);
      
      // Calculate averages
      const daysInMonth = data.length;
      const avgStepsPerDay = Math.round(totalSteps / daysInMonth);
      const avgActiveMinutesPerDay = Math.round(totalActiveMinutes / daysInMonth);
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      const avgWorkoutsPerWeek = parseFloat((totalWorkouts / weeksInMonth).toFixed(1));
      
      // Calculate completion rate (completed goals vs total goals)
      let totalCompletedGoals = 0;
      let totalGoals = 0;
      
      data.forEach(day => {
        if (day.step_count >= day.step_goal) totalCompletedGoals++;
        if (day.active_minutes >= day.active_minutes_goal) totalCompletedGoals++;
        if (day.workouts_completed >= day.workouts_goal) totalCompletedGoals++;
        
        totalGoals += 3; // 3 goals per day
      });
      
      const completionRate = Math.round((totalCompletedGoals / totalGoals) * 100);
      
      // Find most active day
      const mostActiveDay = data.reduce((max, day) => 
        day.step_count > (max ? max.step_count : 0) ? 
          { date: day.date, step_count: day.step_count } : max, 
        null as { date: string, step_count: number } | null
      );
      
      // Get day name for most active day
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const mostActiveDayObj = mostActiveDay ? new Date(mostActiveDay.date) : null;
      const mostActiveDayName = mostActiveDayObj ? dayNames[mostActiveDayObj.getDay()] : 'N/A';
      
      setMonthlySummary({
        totalSteps,
        avgStepsPerDay,
        totalActiveMinutes,
        avgActiveMinutesPerDay,
        totalWorkouts,
        avgWorkoutsPerWeek,
        completionRate,
        mostActiveDay: {
          name: mostActiveDayName,
          steps: mostActiveDay ? mostActiveDay.step_count : 0
        }
      });
    } catch (error: any) {
      console.error('Error calculating monthly summary:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user]);

  return {
    weeklyData,
    monthlySummary,
    isLoading,
    refreshData: fetchWeeklyData
  };
};
