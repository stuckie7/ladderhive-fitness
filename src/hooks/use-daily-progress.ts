
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export interface DailyProgress {
  step_count: number;
  step_goal: number;
  active_minutes: number;
  active_minutes_goal: number;
  workouts_completed: number;
  workouts_goal: number;
  date: string;
}

export const useDailyProgress = (date?: Date) => {
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchDailyProgress = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formattedDate = date 
        ? format(date, 'yyyy-MM-dd') 
        : format(new Date(), 'yyyy-MM-dd');
      
      // If user is logged in, fetch from Supabase
      if (user) {
        const { data, error } = await supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', formattedDate)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw new Error(error.message);
        }
        
        if (data) {
          setProgress(data as DailyProgress);
        } else {
          // Create a new progress entry for today if none exists
          const newProgress = {
            user_id: user.id,
            date: formattedDate,
            step_count: 0,
            step_goal: 10000,
            active_minutes: 0,
            active_minutes_goal: 60,
            workouts_completed: 0,
            workouts_goal: 1
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('daily_progress')
            .insert([newProgress])
            .select()
            .single();
          
          if (insertError) throw new Error(insertError.message);
          
          setProgress(insertedData as DailyProgress);
        }
      } else {
        // Demo data for not logged in users
        setProgress({
          step_count: Math.floor(Math.random() * 8000) + 2000,
          step_goal: 10000,
          active_minutes: Math.floor(Math.random() * 45) + 15,
          active_minutes_goal: 60,
          workouts_completed: Math.random() > 0.5 ? 1 : 0,
          workouts_goal: 1,
          date: formattedDate
        });
      }
    } catch (err) {
      console.error('Error loading daily progress:', err);
      setError('Failed to load daily progress data');
      toast({
        title: 'Error',
        description: 'Failed to load your daily progress.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDailyProgress();
    
    // If this is today's progress, refresh periodically
    if (!date || format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
      const intervalId = setInterval(fetchDailyProgress, 300000); // 5 minutes
      return () => clearInterval(intervalId);
    }
  }, [user, date]);
  
  return { 
    progress, 
    isLoading, 
    error,
    refreshProgress: fetchDailyProgress
  };
};
