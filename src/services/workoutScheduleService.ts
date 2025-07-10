import { supabase } from '../lib/supabase';
import { WorkoutSchedule } from '../types/workout';

export const workoutScheduleService = {
  // Get all workout schedules for the current user
  async getWorkoutSchedules(): Promise<WorkoutSchedule[]> {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select(`
        *,
        prepared_workouts:workout_id (*)
      `)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching workout schedules:', error);
      throw error;
    }

    return data as WorkoutSchedule[];
  },

  // Get a single workout schedule by ID
  async getWorkoutScheduleById(id: string): Promise<WorkoutSchedule | null> {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select(`
        *,
        prepared_workouts:workout_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching workout schedule:', error);
      return null;
    }

    return data as WorkoutSchedule;
  },

  // Create a new workout schedule
  async createWorkoutSchedule(schedule: Omit<WorkoutSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<WorkoutSchedule> {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([{
        user_id: schedule.user_id,
        workout_id: schedule.workout_id,
        scheduled_date: schedule.scheduled_date,
        completed: schedule.completed || false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating workout schedule:', error);
      throw error;
    }

    return data as WorkoutSchedule;
  },

  // Update an existing workout schedule
  async updateWorkoutSchedule(id: string, updates: Partial<WorkoutSchedule>): Promise<WorkoutSchedule> {
    const { data, error } = await supabase
      .from('workout_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workout schedule:', error);
      throw error;
    }

    return data as WorkoutSchedule;
  },

  // Delete a workout schedule
  async deleteWorkoutSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workout schedule:', error);
      throw error;
    }
  },

  // Get upcoming workouts for the current user
  async getUpcomingWorkouts(userId: string, limit = 5): Promise<WorkoutSchedule[]> {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select(`
        *,
        prepared_workouts:workout_id (*)
      `)
      .eq('user_id', userId)
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming workouts:', error);
      return [];
    }

    return data as WorkoutSchedule[];
  }
};
