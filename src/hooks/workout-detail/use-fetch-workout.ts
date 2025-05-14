
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutDetail } from '@/types/workout';

export const useWorkoutFetch = (workoutId: string) => {
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkout = useCallback(async () => {
    if (!workoutId) return;
    
    // Validate UUID format to prevent invalid queries
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workoutId)) {
      console.error('Invalid UUID format:', workoutId);
      setError(new Error('Invalid workout ID format'));
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
        
      if (workoutError) throw workoutError;
      if (!workoutData) throw new Error('Workout not found');
      
      // Prepare the complete workout object
      const completeWorkout: WorkoutDetail = {
        ...workoutData,
        id: workoutData.id,
        title: workoutData.title,
        description: workoutData.description || '',
        duration: workoutData.duration || 0,
        exercises: workoutData.exercises || 0,
        difficulty: workoutData.difficulty || 'Beginner',
      };
      
      setWorkout(completeWorkout);
    } catch (err: any) {
      console.error('Error fetching workout:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [workoutId]);

  // Fetch data on first render
  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  return {
    workout,
    isLoading,
    error,
    fetchWorkout
  };
};
