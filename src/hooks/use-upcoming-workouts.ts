
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface WorkoutSchedule {
  id: string;
  workout_id: string;
  scheduled_date: string;
  status: string;
}

interface SuggestedWorkout {
  id: string;
  name: string;
  duration: number;
  difficulty: string;
}

interface UpcomingWorkout {
  id: string;
  title: string;
  scheduled_date: string;
  duration_minutes: number;
  difficulty: string;
}

export const useUpcomingWorkouts = () => {
  const [workouts, setWorkouts] = useState<UpcomingWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUpcomingWorkouts = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // First get the scheduled workouts
        const { data: schedules, error: schedulesError } = await supabase
          .from('workout_schedules')
          .select('id, workout_id, scheduled_date, status')
          .eq('user_id', user.id)
          .gt('scheduled_date', new Date().toISOString())
          .eq('status', 'scheduled')
          .order('scheduled_date', { ascending: true })
          .limit(3);
        
        if (schedulesError) {
          throw new Error(schedulesError.message);
        }
        
        if (!schedules || schedules.length === 0) {
          setWorkouts([]);
          return;
        }
        
        // Get the workout details for the scheduled workouts
        const workoutIds = schedules.map(s => s.workout_id);
        const { data: workouts, error: workoutsError } = await supabase
          .from('suggested_workouts')
          .select('id, name, duration, difficulty')
          .in('id', workoutIds);
          
        if (workoutsError) {
          throw new Error(workoutsError.message);
        }
        
        // Join the data
        const workoutMap = new Map(workouts?.map(workout => [workout.id, workout]) || []);
        
        const formattedWorkouts: UpcomingWorkout[] = schedules.map(schedule => {
          const workout = workoutMap.get(schedule.workout_id) || {} as Partial<SuggestedWorkout>;
          return {
            id: schedule.id,
            title: workout.name || 'Scheduled Workout',
            scheduled_date: schedule.scheduled_date,
            duration_minutes: workout.duration || 30,
            difficulty: workout.difficulty || 'intermediate'
          };
        });
        
        setWorkouts(formattedWorkouts);
      } catch (err) {
        console.error('Error fetching upcoming workouts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load upcoming workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingWorkouts();
  }, [user]);

  return { workouts, isLoading, error };
};
