
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  step_count: number;
  step_goal: number;
  active_minutes: number;
  active_minutes_goal: number;
  workouts_completed: number;
  workouts_goal: number;
}

export const useDailyProgress = () => {
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDailyProgress = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Check if there's an entry for today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setProgress(data as unknown as DailyProgress);
      } else {
        // If no entry exists for today, create one
        const { data: newEntry, error: insertError } = await supabase
          .from('daily_progress')
          .insert({
            user_id: user.id,
            date: today
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        setProgress(newEntry as unknown as DailyProgress);
      }
    } catch (error: any) {
      console.error('Error fetching daily progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your daily progress.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<DailyProgress>) => {
    if (!user || !progress) return;
    
    try {
      const { error } = await supabase
        .from('daily_progress')
        .update(updates)
        .eq('id', progress.id);
      
      if (error) throw error;
      
      // Update local state
      setProgress(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Progress updated',
        description: 'Your daily progress has been updated.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your progress.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Log steps manually (in a real app, this might come from a fitness tracker API)
  const logSteps = async (steps: number) => {
    if (!progress) return;
    
    return updateProgress({
      step_count: progress.step_count + steps
    });
  };

  // Log active minutes manually
  const logActiveMinutes = async (minutes: number) => {
    if (!progress) return;
    
    return updateProgress({
      active_minutes: progress.active_minutes + minutes
    });
  };

  useEffect(() => {
    if (user) {
      fetchDailyProgress();
    }
  }, [user]);

  return {
    progress,
    isLoading,
    updateProgress,
    logSteps,
    logActiveMinutes,
    refreshProgress: fetchDailyProgress
  };
};
