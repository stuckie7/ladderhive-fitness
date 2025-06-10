
import { useState, useEffect } from 'react';
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

        // Fetch today's progress
        const { data, error } = await supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching daily progress:', error);
          return;
        }

        if (!data) {
          // Create today's progress entry with defaults
          const { data: newProgress, error: insertError } = await supabase
            .from('daily_progress')
            .insert([{
              user_id: user.id,
              date: today,
              step_count: 0,
              step_goal: 10000,
              active_minutes: 0,
              active_minutes_goal: 60,
              workouts_completed: 0,
              workouts_goal: 1
            }])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating daily progress:', insertError);
            return;
          }

          setProgress(newProgress);
        } else {
          // Update workouts completed from workout history for today
          const { data: todayWorkouts, error: workoutError } = await supabase
            .from('workout_history')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today);

          if (!workoutError) {
            const workoutsCompleted = todayWorkouts?.length || 0;
            
            // Update the daily progress with actual workout count
            const { data: updatedProgress, error: updateError } = await supabase
              .from('daily_progress')
              .update({ workouts_completed: workoutsCompleted })
              .eq('user_id', user.id)
              .eq('date', today)
              .select()
              .single();

            if (!updateError && updatedProgress) {
              setProgress(updatedProgress);
            } else {
              setProgress({ ...data, workouts_completed: workoutsCompleted });
            }
          } else {
            setProgress(data);
          }
        }
      } catch (error) {
        console.error('Error in fetchDailyProgress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyProgress();
  }, [user]);

  return { progress, isLoading };
};
