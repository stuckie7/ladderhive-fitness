
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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
  longest_streak: number;
  last_workout_date: string | null;
}

export function useMetrics() {
  const { user } = useAuth();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // First, ensure user statistics are up to date by calling the update function
        const { error: updateError } = await supabase.rpc('update_user_workout_statistics', {
          p_user_id: user.id
        });

        if (updateError) {
          console.error('Error updating user statistics:', updateError);
        }

        // Fetch user workout statistics
        const { data: stats, error: statsError } = await supabase
          .from('user_workout_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching user statistics:', statsError);
          return;
        }

        // If no stats exist, create initial entry
        if (!stats) {
          const { data: newStats, error: insertError } = await supabase
            .from('user_workout_statistics')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating initial user statistics:', insertError);
            return;
          }
          
          // Use the newly created stats (which will have default values)
          if (newStats) {
            updateMetricsFromStats(newStats);
          }
        } else {
          updateMetricsFromStats(stats);
        }

        // Fetch top exercises from workout history
        const { data: workoutHistory, error: historyError } = await supabase
          .from('workout_history')
          .select('exercises')
          .eq('user_id', user.id);

        if (!historyError && workoutHistory) {
          const exerciseCount: { [key: string]: number } = {};
          
          workoutHistory.forEach(workout => {
            if (workout.exercises && Array.isArray(workout.exercises)) {
              workout.exercises.forEach((exercise: any) => {
                const exerciseName = exercise.name || exercise.exercise_name || 'Unknown Exercise';
                exerciseCount[exerciseName] = (exerciseCount[exerciseName] || 0) + 1;
              });
            }
          });

          const topExercisesList = Object.entries(exerciseCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([exercise, count]) => ({ exercise, count }));

          setTopExercises(topExercisesList);
        }

      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const updateMetricsFromStats = (statsData: any) => {
      const avgCalories = statsData.total_workouts > 0 ? Math.round(statsData.total_calories / statsData.total_workouts) : 0;
      const avgDuration = statsData.total_workouts > 0 ? Math.round(statsData.total_minutes / statsData.total_workouts) : 0;
      
      setMetrics([
        { name: 'Total Workouts', value: statsData.total_workouts || 0, unit: '' },
        { name: 'Calories Burned', value: statsData.total_calories || 0, unit: 'cal' },
        { name: 'Calories per Workout', value: avgCalories, unit: 'cal' },
        { name: 'Completion Rate', value: Math.round(statsData.completion_rate || 0), unit: '%' },
        { name: 'Current Streak', value: statsData.current_streak || 0, unit: 'days' },
        { name: 'Avg Workout Duration', value: avgDuration, unit: 'min' },
        { name: 'Weekly Workouts', value: statsData.weekly_workouts || 0, unit: '' },
        { name: 'Monthly Workouts', value: statsData.monthly_workouts || 0, unit: '' },
        { name: 'Quarterly Workouts', value: statsData.quarterly_workouts || 0, unit: '' },
        { name: 'Yearly Workouts', value: statsData.yearly_workouts || 0, unit: '' }
      ]);
    };

    fetchMetrics();
  }, [user]);

  return { metrics, topExercises, isLoading };
}
