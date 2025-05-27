
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { supabase } from '@/lib/supabase';
import { Workout, ScheduledWod } from '@/types/workout';
import { AdminScheduledWorkout, UserSuggestedWorkout } from '@/types/admin';
import { format, addDays } from 'date-fns';

interface UseDashboardDataReturn {
  workouts: Workout[];
  scheduledWorkouts: AdminScheduledWorkout[];
  scheduledWods: ScheduledWod[];
  suggestedWorkouts: UserSuggestedWorkout[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

const useDashboardData = (): UseDashboardDataReturn => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<AdminScheduledWorkout[]>([]);
  const [scheduledWods, setScheduledWods] = useState<ScheduledWod[]>([]);
  const [suggestedWorkouts, setSuggestedWorkouts] = useState<UserSuggestedWorkout[]>([]);
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

      // Fetch user created workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id);

      if (workoutsError) {
        throw new Error(workoutsError.message);
      }

      setWorkouts(workoutsData as Workout[] || []);

      // Fetch admin scheduled workouts
      const { data: scheduledWorkoutsData, error: scheduledWorkoutsError } = await supabase
        .from('scheduled_workouts')
        .select(`
          *,
          workout:prepared_workouts(*)
        `)
        .eq('user_id', user.id)
        .gte('scheduled_date', new Date().toISOString().split('T')[0]);

      if (scheduledWorkoutsError) {
        throw new Error(scheduledWorkoutsError.message);
      }

      setScheduledWorkouts(scheduledWorkoutsData as AdminScheduledWorkout[] || []);

      // Fetch suggested workouts
      const { data: suggestedWorkoutsData, error: suggestedWorkoutsError } = await supabase
        .from('user_suggested_workouts')
        .select(`
          *,
          workout:prepared_workouts(*)
        `)
        .eq('user_id', user.id)
        .eq('is_read', false)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString());

      if (suggestedWorkoutsError) {
        throw new Error(suggestedWorkoutsError.message);
      }

      setSuggestedWorkouts(suggestedWorkoutsData as UserSuggestedWorkout[] || []);

      // Fetch WODs data
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
          duration_minutes: wod.avg_duration_minutes,
          type: 'wod',
          name: wod.name,
          description: wod.description,
          difficulty: wod.difficulty,
          avg_duration_minutes: wod.avg_duration_minutes,
          category: wod.category,
          title: wod.name,
          created_at: new Date().toISOString(),
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
    suggestedWorkouts,
    isLoading,
    error,
    refreshData,
  };
};

export default useDashboardData;
