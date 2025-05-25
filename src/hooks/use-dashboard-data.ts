
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { supabase } from '@/lib/supabase';
import { Workout, ScheduledWod, ScheduledWorkout } from '@/types/workout';
import { format, addDays } from 'date-fns';

interface UseDashboardDataReturn {
  workouts: Workout[];
  scheduledWorkouts: ScheduledWorkout[];
  scheduledWods: ScheduledWod[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

const useDashboardData = (): UseDashboardDataReturn => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
    const [scheduledWods, setScheduledWods] = useState<ScheduledWod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        setError("Not authenticated");
        return;
      }

      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id);

      if (workoutsError) {
        throw new Error(workoutsError.message);
      }

      setWorkouts(workoutsData as Workout[] || []);

      // Fetch scheduled workouts
      const { data: scheduledWorkoutsData, error: scheduledWorkoutsError } = await supabase
        .from('scheduled_workouts')
        .select('*')
        .eq('user_id', user.id);

      if (scheduledWorkoutsError) {
        throw new Error(scheduledWorkoutsError.message);
      }

      setScheduledWorkouts(scheduledWorkoutsData as ScheduledWorkout[] || []);

            const { data: wodsData, error: wodsError } = await supabase
        .from('wods')
        .select('*');

      if (wodsError) {
        throw new Error(wodsError.message);
      }

            setScheduledWods(
        wodsData?.map((wod: any) => ({
          id: wod.id,
          scheduledDate: format(addDays(new Date(), Math.floor(Math.random() * 7)), 'yyyy-MM-dd'),
          duration_minutes: wod.duration_minutes,
          type: 'wod',
          name: wod.name,
          description: wod.description,
          difficulty: wod.difficulty,
          avg_duration_minutes: wod.avg_duration_minutes,
          category: wod.category,
          title: wod.name, // Add missing title property
          created_at: new Date().toISOString(), // Add missing created_at property
        })) as ScheduledWod[] || []
      );
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const refreshData = () => {
    fetchWorkouts();
  };

  return {
    workouts,
    scheduledWorkouts,
    scheduledWods,
    isLoading,
    error,
    refreshData,
  };
};

export default useDashboardData;
