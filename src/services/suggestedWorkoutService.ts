
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
    console.log('Fetching suggested workouts for user:', userId);
    
    // First, get user's workout history to personalize suggestions
    const { data: history } = await supabase
      .from('workout_history')
      .select('workout_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's fitness level or preferences (if available)
    const { data: userData } = await supabase
      .from('profiles')
      .select('fitness_level, fitness_goals')
      .eq('id', userId)
      .single();

    // Get prepared workouts as suggested workouts
    let query = supabase
      .from('prepared_workouts')
      .select('*')
      .limit(limit);

    // Filter by user's fitness level if available
    if (userData?.fitness_level && userData.fitness_level !== 'All Levels') {
      query = query.eq('difficulty', userData.fitness_level);
    }

    // Get suggested workouts from prepared workouts
    const { data: suggestedWorkouts, error } = await query;

    if (error) {
      console.error('Error fetching suggested workouts:', error);
      throw error;
    }

    // Transform prepared workouts to suggested workout format
    const transformedWorkouts: SuggestedWorkout[] = (suggestedWorkouts || []).map(workout => ({
      id: workout.id,
      name: workout.title,
      description: workout.description,
      difficulty: workout.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
      duration: workout.duration_minutes,
      category: workout.category || 'General',
      target_muscles: [], // Would need to be calculated from exercises
      image_url: workout.thumbnail_url,
      created_by: 'system',
      created_at: workout.created_at,
      updated_at: workout.updated_at
    }));

    console.log('Transformed suggested workouts:', transformedWorkouts);
    return transformedWorkouts;
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
    console.log('Adding workout to schedule:', { userId, workoutId, scheduledDate });
    
    const { data, error } = await supabase
      .from('scheduled_workouts')
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

    if (error) {
      console.error('Error adding workout to schedule:', error);
      throw error;
    }
    
    console.log('Successfully added workout to schedule:', data);
    return data;
  } catch (error) {
    console.error('Error adding workout to schedule:', error);
    throw error;
  }
};
