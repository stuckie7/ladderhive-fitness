
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DailyProgress {
  step_count: number;
  step_goal: number;
  active_minutes: number;
  active_minutes_goal: number;
  workouts_completed: number;
  workouts_goal: number;
  date: string;
}

// Mock function to fetch daily progress data
const fetchDailyProgress = async (userId: string, date?: Date): Promise<DailyProgress> => {
  // In a real implementation, this would fetch from Supabase
  // const { data, error } = await supabase
  //   .from('daily_progress')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .eq('date', date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
  //   .single();
  
  // if (error) throw new Error(error.message);
  // return data as DailyProgress;
  
  // For now, return mock data
  return {
    step_count: 7532,
    step_goal: 10000,
    active_minutes: 42,
    active_minutes_goal: 60,
    workouts_completed: 1,
    workouts_goal: 1,
    date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  };
};

export const useDailyProgress = (date?: Date) => {
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userId = user?.id || 'demo-user';
        const data = await fetchDailyProgress(userId, date);
        setProgress(data);
      } catch (err) {
        console.error('Error loading daily progress:', err);
        setError('Failed to load daily progress data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgress();
  }, [user, date]);
  
  return { progress, isLoading, error };
};
