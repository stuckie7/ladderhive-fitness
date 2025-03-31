
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Workout {
  id: string;
  title: string;
  description: string;
  duration: number;
  exercises: number;
  difficulty: string;
}

interface SaveWorkoutResult {
  success: boolean;
  error?: any;
}

export const useWorkouts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveWorkout = async (workoutId: string): Promise<SaveWorkoutResult> => {
    if (!user) return { success: false };
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_workouts')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          status: 'saved'
        });
      
      if (error) throw error;
      
      toast({
        title: "Workout saved",
        description: "The workout has been added to your saved list.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workout. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const unsaveWorkout = async (workoutId: string): Promise<SaveWorkoutResult> => {
    if (!user) return { success: false };
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_workouts')
        .delete()
        .eq('user_id', user.id)
        .eq('workout_id', workoutId)
        .eq('status', 'saved');
      
      if (error) throw error;
      
      toast({
        title: "Workout removed",
        description: "The workout has been removed from your saved list.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove workout. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const completeWorkout = async (workoutId: string): Promise<SaveWorkoutResult> => {
    if (!user) return { success: false };
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_workouts')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          status: 'completed',
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been marked as completed.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark workout as completed. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const scheduledWorkout = async (workoutId: string, date: Date): Promise<SaveWorkoutResult> => {
    if (!user) return { success: false };
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_workouts')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          status: 'planned',
          planned_for: date.toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Workout scheduled",
        description: "The workout has been added to your plan.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule workout. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveWorkout,
    unsaveWorkout,
    completeWorkout,
    scheduledWorkout
  };
};
