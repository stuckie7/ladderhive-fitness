
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type WorkoutLoaderResult = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration_minutes: number;
  category: string;
  goal: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_template: boolean;
  exercises?: {
    id: string;
    workout_id: string;
    exercise_id: number;
    sets: number;
    reps: string;
    rest_seconds: number;
    order_index: number;
    notes?: string;
    exercise?: any;
  }[];
}

export const useWorkoutLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadWorkout = async (workoutId: string): Promise<WorkoutLoaderResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the workout data
      const { data: workout, error: workoutError } = await supabase
        .from('user_created_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
        
      if (workoutError) {
        throw workoutError;
      }
      
      if (!workout) {
        setError('Workout not found');
        return null;
      }
      
      // Fetch the exercises for this workout
      const { data: exercises, error: exercisesError } = await supabase
        .from('user_created_workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('order_index');
        
      if (exercisesError) {
        throw exercisesError;
      }
      
      return {
        ...workout,
        exercises: exercises || []
      };
    } catch (err: any) {
      setError(err.message || 'Failed to load workout');
      toast({
        title: 'Error loading workout',
        description: err.message || 'Failed to load workout',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    loadWorkout,
    isLoading,
    error
  };
};
