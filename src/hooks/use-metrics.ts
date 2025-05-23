import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface MetricData {
  name: string;
  value: number;
  change?: number;
  unit?: string;
}

export interface WorkoutStats {
  total_workouts: number;
  total_calories: number;
  avg_calories: number;
  total_minutes: number;
  avg_duration: number;
  weekly_workouts: number;
  monthly_workouts: number;
  quarterly_workouts: number;
  yearly_workouts: number;
  current_streak: number;
  completion_rate: number;
  top_exercises: Array<{ exercise: string; count: number }>;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([
    { name: 'Total Workouts', value: 0, unit: '' },
    { name: 'Calories Burned', value: 0, unit: 'cal' },
    { name: 'Calories per Workout', value: 0, unit: 'cal' },
    { name: 'Completion Rate', value: 0, unit: '%' },
    { name: 'Current Streak', value: 0, unit: 'days' },
    { name: 'Avg Workout Duration', value: 0, unit: 'min' },
    { name: 'Weekly Workouts', value: 0, unit: '' },
    { name: 'Monthly Workouts', value: 0, unit: '' },
    { name: 'Quarterly Workouts', value: 0, unit: '' },
    { name: 'Yearly Workouts', value: 0, unit: '' }
  ]);

  const [topExercises, setTopExercises] = useState<Array<{ exercise: string; count: number }>>([]);

  useEffect(() => {
    let subscription: any = null;
    let mounted = true;

    const fetchMetrics = async () => {
      try {
        // Get user ID
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) return;

        // Initial fetch
        const { data: stats, error: fetchError } = await supabase
          .from('workout_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        if (!stats) return;

        if (mounted) {
          updateMetrics(stats);
        }

        // Set up real-time subscription
        subscription = supabase
          .channel('workout_stats_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'workout_statistics',
            filter: `user_id=eq.${user.id}`
          }, (payload) => {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              updateMetrics(payload.new);
            }
          })
          .subscribe();

      } catch (error) {
        console.error('Error in metrics subscription:', error);
      }
    };

    const updateMetrics = (statsData: any) => {
      setMetrics([
        { name: 'Total Workouts', value: statsData.total_workouts || 0, unit: '' },
        { name: 'Calories Burned', value: statsData.total_calories || 0, unit: 'cal' },
        { name: 'Calories per Workout', value: Math.round(statsData.avg_calories) || 0, unit: 'cal' },
        { name: 'Completion Rate', value: Math.round(statsData.completion_rate) || 0, unit: '%' },
        { name: 'Current Streak', value: statsData.current_streak || 0, unit: 'days' },
        { name: 'Avg Workout Duration', value: Math.round(statsData.avg_duration) || 0, unit: 'min' },
        { name: 'Weekly Workouts', value: statsData.weekly_workouts || 0, unit: '' },
        { name: 'Monthly Workouts', value: statsData.monthly_workouts || 0, unit: '' },
        { name: 'Quarterly Workouts', value: statsData.quarterly_workouts || 0, unit: '' },
        { name: 'Yearly Workouts', value: statsData.yearly_workouts || 0, unit: '' }
      ]);

      setTopExercises(statsData.top_exercises || []);
    };

    fetchMetrics();

    // Cleanup function
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { metrics, topExercises };
}
