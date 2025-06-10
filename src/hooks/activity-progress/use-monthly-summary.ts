
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MonthlySummary } from '@/types/activity';

export const useMonthlySummary = () => {
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const calculateMonthlySummary = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      // Fetch the month's daily progress data
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_progress')
        .select('date, step_count, step_goal, active_minutes, active_minutes_goal, workouts_completed, workouts_goal')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      // Fetch workout history for the month
      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_history')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (dailyError) {
        console.error('Error fetching daily data:', dailyError);
      }
      
      if (workoutError) {
        console.error('Error fetching workout data:', workoutError);
      }

      // Use workout history for more accurate workout counts
      const workoutCountsByDate: { [key: string]: number } = {};
      if (workoutData) {
        workoutData.forEach(workout => {
          const date = workout.date;
          workoutCountsByDate[date] = (workoutCountsByDate[date] || 0) + 1;
        });
      }

      const totalWorkouts = Object.values(workoutCountsByDate).reduce((sum, count) => sum + count, 0);
      
      if (!dailyData || dailyData.length === 0) {
        // If no daily data, create a basic summary using workout data
        const daysInMonth = Math.ceil((today.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
        const weeksInMonth = Math.ceil(daysInMonth / 7);
        
        setMonthlySummary({
          totalSteps: 0,
          avgStepsPerDay: 0,
          totalActiveMinutes: 0,
          avgActiveMinutesPerDay: 0,
          totalWorkouts,
          avgWorkoutsPerWeek: parseFloat((totalWorkouts / weeksInMonth).toFixed(1)),
          completionRate: 0,
          mostActiveDay: {
            name: 'N/A',
            steps: 0
          }
        });
        return;
      }

      // Calculate totals and averages from daily data
      const totalSteps = dailyData.reduce((sum, day) => sum + (day.step_count || 0), 0);
      const totalActiveMinutes = dailyData.reduce((sum, day) => sum + (day.active_minutes || 0), 0);
      
      const daysWithData = dailyData.length;
      const avgStepsPerDay = daysWithData > 0 ? Math.round(totalSteps / daysWithData) : 0;
      const avgActiveMinutesPerDay = daysWithData > 0 ? Math.round(totalActiveMinutes / daysWithData) : 0;
      const weeksInMonth = Math.ceil(daysWithData / 7);
      const avgWorkoutsPerWeek = weeksInMonth > 0 ? parseFloat((totalWorkouts / weeksInMonth).toFixed(1)) : 0;
      
      // Calculate completion rate based on daily goals achieved
      let totalGoalsAchieved = 0;
      let totalPossibleGoals = 0;
      
      dailyData.forEach(day => {
        if (day.step_count >= (day.step_goal || 10000)) totalGoalsAchieved++;
        if (day.active_minutes >= (day.active_minutes_goal || 60)) totalGoalsAchieved++;
        const actualWorkouts = workoutCountsByDate[day.date] || 0;
        if (actualWorkouts >= (day.workouts_goal || 1)) totalGoalsAchieved++;
        totalPossibleGoals += 3; // 3 goals per day
      });
      
      const completionRate = totalPossibleGoals > 0 ? Math.round((totalGoalsAchieved / totalPossibleGoals) * 100) : 0;
      
      // Find most active day by steps
      const mostActiveDay = dailyData.reduce((max, day) => 
        (day.step_count || 0) > (max ? max.step_count : 0) ? 
          { date: day.date, step_count: day.step_count || 0 } : max, 
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
      // Set a basic summary in case of error
      setMonthlySummary({
        totalSteps: 0,
        avgStepsPerDay: 0,
        totalActiveMinutes: 0,
        avgActiveMinutesPerDay: 0,
        totalWorkouts: 0,
        avgWorkoutsPerWeek: 0,
        completionRate: 0,
        mostActiveDay: {
          name: 'N/A',
          steps: 0
        }
      });
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
