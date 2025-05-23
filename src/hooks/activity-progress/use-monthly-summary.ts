
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MonthlySummary } from '@/types/activity';

export const useMonthlySummary = () => {
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const calculateMonthlySummary = async () => {
    if (!user) return;

    setIsLoading(true);
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
        setIsLoading(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      calculateMonthlySummary();
    }
  }, [user]);

  return {
    monthlySummary,
    isLoading,
    refreshData: calculateMonthlySummary
  };
};
