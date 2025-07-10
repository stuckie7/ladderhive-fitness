
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Fetch a workout by ID
export const fetchWorkoutById = async (workoutId: string) => {
  try {
    // First try prepared workouts
    let { data, error } = await supabase
      .from('prepared_workouts')
      .select('*')
      .eq('id', workoutId)
      .maybeSingle();
      
    if (!data) {
      // If not found in prepared workouts, try user created workouts
      const { data: userWorkout, error: userWorkoutError } = await supabase
        .from('user_created_workouts')
        .select('*')
        .eq('id', workoutId)
        .maybeSingle();
        
      if (userWorkoutError) {
        console.error('Error fetching workout:', userWorkoutError);
        return null;
      }
      
      return userWorkout;
    } else if (error) {
      console.error('Error fetching workout:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error fetching workout:', err);
    return null;
  }
};

// Hook for fetching workout details
export const useFetchWorkout = (workoutId?: string) => {
  const [workout, setWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getWorkout = async () => {
      if (!workoutId) {
        setWorkout(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const workoutData = await fetchWorkoutById(workoutId);
        
        if (!workoutData) {
          setError(new Error('Workout not found'));
          setWorkout(null);
        } else {
          setWorkout(workoutData);
          setError(null);
        }
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error('Failed to fetch workout'));
        console.error('Error fetching workout:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getWorkout();
  }, [workoutId]);

  return { workout, isLoading, error };
};
