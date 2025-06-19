
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

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
    video_url?: string;
  } | null;
}

export const useScheduledWorkouts = ({ selectedDate, month }: { selectedDate?: Date; month?: Date }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchScheduledWorkouts = async () => {
    if (!user) return [];

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
          thumbnail_url,
          video_url
        )
      `)
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: true });

    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      query = query.eq('scheduled_date', dateStr);
    } else {
      const baseDate = month || new Date();
      const monthStart = startOfMonth(subMonths(baseDate, 1));
      const monthEnd = endOfMonth(addMonths(baseDate, 1));
      
      const startStr = format(monthStart, 'yyyy-MM-dd');
      const endStr = format(monthEnd, 'yyyy-MM-dd');
      
      query = query.gte('scheduled_date', startStr).lte('scheduled_date', endStr);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  };

  const {
    data: scheduledWorkouts,
    isLoading,
    refetch,
  } = useQuery<ScheduledWorkout[], Error>({
    queryKey: ['scheduledWorkouts', user?.id, selectedDate?.getTime(), month?.getTime()],
    queryFn: fetchScheduledWorkouts,
    enabled: !!user,
    onError: (err) => {
      console.error('Error fetching scheduled workouts:', err);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled workouts',
        variant: 'destructive',
      });
    },
  });

  return {
    scheduledWorkouts: scheduledWorkouts ?? [],
    isLoading,
    refetch,
  };
};
