
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRecentWorkouts = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          throw new Error('User not authenticated');
        }
        
        const { data, error: workoutsError } = await supabase
          .from('workout_history')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('date', { ascending: false })
          .limit(5);
        
        if (workoutsError) throw workoutsError;
        
        setWorkouts(data || []);
      } catch (err: any) {
        console.error('Error fetching recent workouts:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentWorkouts();
  }, []);

  return { workouts, isLoading, error };
};
