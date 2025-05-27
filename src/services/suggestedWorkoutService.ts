import { supabase } from '@/lib/supabase';
import { Workout } from '@/types/workout';

export interface SuggestedWorkout {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  category: string;
  target_muscles: string[];
  image_url?: string;
  created_by?: string; // user ID or 'system'
  created_at?: string;
  updated_at?: string;
}

export const getSuggestedWorkouts = async (userId: string, limit: number = 5): Promise<SuggestedWorkout[]> => {
  try {
    // First, get user's workout history to personalize suggestions
    const { data: history } = await supabase
      .from('workout_history')
      .select('workout_id, workouts(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    // Get user's fitness level or preferences (if available)
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('fitness_level, goals')
      .eq('user_id', userId)
      .single();

    // Build query based on user's history and preferences
    let query = supabase
      .from('suggested_workouts')
      .select('*')
      .limit(limit);

    // Filter by user's fitness level if available
    if (userData?.fitness_level) {
      query = query.eq('difficulty', userData.fitness_level);
    }

    // Get suggested workouts
    const { data: suggestedWorkouts, error } = await query;

    if (error) throw error;

    return suggestedWorkouts || [];
  } catch (error) {
    console.error('Error getting suggested workouts:', error);
    return [];
  }
};

export const addWorkoutToSchedule = async (
  userId: string, 
  workoutId: string, 
  scheduledDate: string
) => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([
        {
          user_id: userId,
          workout_id: workoutId,
          scheduled_date: scheduledDate,
          status: 'scheduled'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding workout to schedule:', error);
    throw error;
  }
};
