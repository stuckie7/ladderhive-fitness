
import { useState, useEffect } from 'react';
import { invokeWithAuth } from '@/lib/invokeWithAuth';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface DailyProgress {
  step_count: number;
  step_goal: number;
  active_minutes: number;
  active_minutes_goal: number;
  workouts_completed: number;
  workouts_goal: number;
  date: string;
}

export const useDailyProgress = () => {
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDailyProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // 1. Ensure a daily_progress row exists
        let { data: progressRow, error: progressErr } = await supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (progressErr && progressErr.code !== 'PGRST116') throw progressErr;

        if (!progressRow) {
          const { data: inserted, error: insertErr } = await supabase
            .from('daily_progress')
            .insert([
              {
                user_id: user.id,
                date: today,
                step_count: 0,
                step_goal: 10000,
                active_minutes: 0,
                active_minutes_goal: 60,
                workouts_completed: 0,
                workouts_goal: 1,
              },
            ])
            .select()
            .single();
          if (insertErr) throw insertErr;
          progressRow = inserted;
        }

        // 2. Determine workouts completed today
        const { data: workoutsToday, error: workoutsErr } = await supabase
          .from('workout_sessions')
          .select('id')
          .eq('user_id', user.id)
          .gte('started_at', `${today} 00:00:00`)
          .lte('started_at', `${today} 23:59:59`);
        if (workoutsErr) throw workoutsErr;
        const workoutsCompleted = workoutsToday?.length || 0;

        // 3. Fetch Fitbit stats for the day
        let steps = progressRow.step_count;
        let activeMinutes = progressRow.active_minutes;
        try {
          const { data: fitbitRes } = await invokeWithAuth<{ stats?: { steps?: number; activeMinutes?: number } }>(
            'fitbit-fetch-data',
            {
              method: 'POST',
              body: JSON.stringify({ date: today }),
            },
          );
          if (fitbitRes?.stats) {
            steps = fitbitRes.stats.steps ?? steps;
            activeMinutes = fitbitRes.stats.activeMinutes ?? activeMinutes;
          }
        } catch (fetchErr) {
          console.warn('Unable to retrieve Fitbit data:', fetchErr);
        }

        // 4. Prepare updated object and persist changes if necessary
        const updated: DailyProgress = {
          ...progressRow,
          step_count: steps,
          active_minutes: activeMinutes,
          workouts_completed: workoutsCompleted,
        };

        const needUpdate =
          steps !== progressRow.step_count ||
          activeMinutes !== progressRow.active_minutes ||
          workoutsCompleted !== progressRow.workouts_completed;

        if (needUpdate) {
          const { error: updErr } = await supabase
            .from('daily_progress')
            .update({
              step_count: steps,
              active_minutes: activeMinutes,
              workouts_completed: workoutsCompleted,
            })
            .eq('user_id', user.id)
            .eq('date', today);
          if (updErr) console.error('Failed to update daily_progress:', updErr);
        }

        setProgress(updated);
      } catch (err) {
        console.error('Error fetching daily progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyProgress();
  }, [user]);

  return { progress, isLoading };
};
