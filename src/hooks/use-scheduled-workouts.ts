
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ScheduledWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  status: string;
  admin_message: string | null;
  created_at: string;
  scheduled_by_admin: string | null;
  prepared_workouts: {
    id: string;
    title: string;
    difficulty: string;
    duration_minutes: number;
    description?: string;
    thumbnail_url?: string;
  } | null;
}

export const useScheduledWorkouts = (selectedDate?: Date) => {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScheduledWorkouts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      let query = supabase
        .from('scheduled_workouts')
        .select(`
          *,
          prepared_workouts (
            id,
            title,
            difficulty,
            duration_minutes,
            description,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      // If a specific date is selected, filter by that date
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        query = query.eq('scheduled_date', dateStr);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      setScheduledWorkouts(data || []);
    } catch (err) {
      console.error('Error fetching scheduled workouts:', err);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled workouts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledWorkouts();
  }, [user, selectedDate]);

  return {
    scheduledWorkouts,
    isLoading,
    refetch: fetchScheduledWorkouts
  };
};
