
import { supabase } from '@/integrations/supabase/client';

// Fetch a workout by ID from either prepared_workouts or user_created_workouts
export const fetchWorkoutById = async (workoutId: string) => {
  try {
    // First try to find in prepared workouts
    const { data: preparedWorkout, error: preparedError } = await supabase
      .from('prepared_workouts')
      .select('*')
      .eq('id', workoutId)
      .single();
    
    // If found in prepared workouts, return it
    if (preparedWorkout && !preparedError) {
      console.log('Found workout in prepared_workouts:', preparedWorkout);
      return preparedWorkout;
    }
    
    // If not found in prepared workouts, try user_created_workouts
    const { data: userWorkout, error: userError } = await supabase
      .from('user_created_workouts')
      .select('*')
      .eq('id', workoutId)
      .single();
    
    if (userWorkout && !userError) {
      console.log('Found workout in user_created_workouts:', userWorkout);
      return userWorkout;
    }
    
    // If we reach here, workout was not found in either table
    if (preparedError) console.error('Error fetching from prepared_workouts:', preparedError);
    if (userError) console.error('Error fetching from user_created_workouts:', userError);
    
    console.warn('Workout not found in either table:', workoutId);
    return null;
  } catch (error) {
    console.error('Unexpected error in fetchWorkoutById:', error);
    throw error;
  }
};

// This is an empty hook as we've moved the functionality to a standalone function
// Kept for backward compatibility
export const useFetchWorkout = () => {
  return {
    fetchWorkoutById
  };
};
