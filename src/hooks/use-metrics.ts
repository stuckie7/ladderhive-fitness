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
    const fetchMetrics = async () => {
      try {
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: stats } = await supabase
          .from('workout_statistics')
          .select('*')
          .eq('user_id', user.id);

        if (stats && stats.length > 0) {
          const statsData = stats[0];
          
          setMetrics([
            { name: 'Total Workouts', value: statsData.total_workouts, unit: '' },
            { name: 'Calories Burned', value: statsData.total_calories, unit: 'cal' },
            { name: 'Calories per Workout', value: Math.round(statsData.avg_calories), unit: 'cal' },
            { name: 'Completion Rate', value: Math.round(statsData.completion_rate), unit: '%' },
            { name: 'Current Streak', value: statsData.current_streak, unit: 'days' },
            { name: 'Avg Workout Duration', value: Math.round(statsData.avg_duration), unit: 'min' },
            { name: 'Weekly Workouts', value: statsData.weekly_workouts, unit: '' },
            { name: 'Monthly Workouts', value: statsData.monthly_workouts, unit: '' },
            { name: 'Quarterly Workouts', value: statsData.quarterly_workouts, unit: '' },
            { name: 'Yearly Workouts', value: statsData.yearly_workouts, unit: '' }
          ]);

          setTopExercises(statsData.top_exercises || []);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, topExercises };
}
