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

        // Pull sessions for last 30 days
        const { data: sessions, error } = await supabase
          .from('workout_sessions')
          .select('started_at')
          .eq('user_id', user.id)
          .gte('started_at', thirtyDaysAgo.toISOString());
        if (error) throw error;

        // group by date string
        const countByDate: Record<string, number> = {};
        sessions?.forEach((s) => {
          const dateStr = new Date(s.started_at).toISOString().split('T')[0];
          countByDate[dateStr] = (countByDate[dateStr] || 0) + 1;
        });

        // Weekly data (last 7 days)
        const tmpWeekly: ActivityData[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(sevenDaysAgo);
          d.setDate(sevenDaysAgo.getDate() + i);
          const dStr = d.toISOString().split('T')[0];
          tmpWeekly.push({
            date: dStr,
            day: d.toLocaleDateString(undefined, { weekday: 'short' }),
            steps: 0, // not tracked
            active_minutes: 0,
            workouts: countByDate[dStr] || 0,
          });
        }
        setWeeklyData(tmpWeekly);

        // Monthly summary
        let totalWorkouts = 0;
        const weeksElapsed = Math.ceil(30 / 7);
        Object.keys(countByDate).forEach((d) => {
          totalWorkouts += countByDate[d];
        });
        const monthSum: MonthlySummary = {
          totalSteps: 0,
          avgStepsPerDay: 0,
          totalActiveMinutes: 0,
          avgActiveMinutesPerDay: 0,
          totalWorkouts,
          avgWorkoutsPerWeek: Math.round(totalWorkouts / weeksElapsed * 10) / 10,
          completionRate: (totalWorkouts / 30) * 100,
          mostActiveDay: { name: '', steps: 0 },
        } as MonthlySummary;
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
