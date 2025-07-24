import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ActivityData, MonthlySummary } from '@/types/activity';

export interface ActivityProgressResult {
  weeklyData: ActivityData[];
  monthlySummary: MonthlySummary;
  isLoading: boolean;
}

export const useActivityProgress = (): ActivityProgressResult => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<ActivityData[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // inclusive of today
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29);

        // --- Fetch workout sessions for the last 30 days ---
        const { data: sessions, error: sessionError } = await supabase
          .from('workout_sessions')
          .select('started_at')
          .eq('user_id', user.id)
          .gte('started_at', thirtyDaysAgo.toISOString());
        if (sessionError) throw sessionError;

        // Count workouts per day
        const workoutsByDate: Record<string, number> = {};
        sessions?.forEach((s) => {
          const dateStr = new Date(s.started_at).toISOString().split('T')[0];
          workoutsByDate[dateStr] = (workoutsByDate[dateStr] || 0) + 1;
        });

        // --- Fetch Fitbit stats (steps & active minutes) saved in daily_progress ---
        const { data: progressRows, error: progressError } = await supabase
          .from('daily_progress')
          .select('date, step_count, active_minutes')
          .eq('user_id', user.id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
        if (progressError) throw progressError;

        const stepsByDate: Record<string, number> = {};
        const activeByDate: Record<string, number> = {};
        let totalSteps = 0;
        let totalActiveMinutes = 0;

        progressRows?.forEach((row: { date: string; step_count: number; active_minutes: number }) => {
          stepsByDate[row.date] = row.step_count;
          activeByDate[row.date] = row.active_minutes;
          totalSteps += row.step_count;
          totalActiveMinutes += row.active_minutes;
        });

        // --- Build Weekly Data (last 7 days) ---
        const tmpWeekly: ActivityData[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(sevenDaysAgo);
          d.setDate(sevenDaysAgo.getDate() + i);
          const dStr = d.toISOString().split('T')[0];
          tmpWeekly.push({
            date: dStr,
            day: d.toLocaleDateString(undefined, { weekday: 'short' }),
            steps: stepsByDate[dStr] || 0,
            active_minutes: activeByDate[dStr] || 0,
            workouts: workoutsByDate[dStr] || 0,
          });
        }
        setWeeklyData(tmpWeekly);

        // --- Build Monthly Summary (last 30 days) ---
        const daysInRange = 30;
        const weeksElapsed = Math.ceil(daysInRange / 7);
        const totalWorkouts = Object.values(workoutsByDate).reduce((sum, v) => sum + v, 0);

        // Determine most active day by steps
        let mostActiveDayName = '';
        let mostActiveSteps = 0;
        Object.keys(stepsByDate).forEach((dStr) => {
          if (stepsByDate[dStr] > mostActiveSteps) {
            mostActiveSteps = stepsByDate[dStr];
            mostActiveDayName = new Date(dStr).toLocaleDateString(undefined, { weekday: 'long' });
          }
        });

        const monthSum: MonthlySummary = {
          totalSteps,
          avgStepsPerDay: Math.round((totalSteps / daysInRange) * 10) / 10,
          totalActiveMinutes,
          avgActiveMinutesPerDay: Math.round((totalActiveMinutes / daysInRange) * 10) / 10,
          totalWorkouts,
          avgWorkoutsPerWeek: Math.round((totalWorkouts / weeksElapsed) * 10) / 10,
          completionRate: (totalWorkouts / daysInRange) * 100,
          mostActiveDay: { name: mostActiveDayName, steps: mostActiveSteps },
        };
        setMonthlySummary(monthSum);
      } catch (e) {
        console.error('Error fetching activity progress', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return {
    weeklyData,
    monthlySummary: monthlySummary || {
      totalSteps: 0,
      avgStepsPerDay: 0,
      totalActiveMinutes: 0,
      avgActiveMinutesPerDay: 0,
      totalWorkouts: 0,
      avgWorkoutsPerWeek: 0,
      completionRate: 0,
      mostActiveDay: { name: '', steps: 0 },
    },
    isLoading,
  };
};
