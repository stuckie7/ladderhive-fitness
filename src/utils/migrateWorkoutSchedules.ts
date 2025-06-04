import { supabase } from '@/lib/supabase';
import { WorkoutSchedule } from '@/types/workout';

/**
 * Migrates any existing workout data to the new workout_schedules table
 * This is a one-time migration that can be run after the table is created
 */
export async function migrateWorkoutSchedules() {
  try {
    console.log('Starting workout schedules migration...');
    
    // Check if we have any existing scheduled workouts in the old format
    const { data: existingSchedules, error: fetchError } = await supabase
      .from('scheduled_workouts') // This would be your old table name if it exists
      .select('*');
    
    if (fetchError && fetchError.code !== '42P01') { // 42P01 is "relation does not exist"
      console.error('Error checking for existing schedules:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // If we found existing schedules, migrate them
    if (existingSchedules && existingSchedules.length > 0) {
      console.log(`Found ${existingSchedules.length} schedules to migrate`);
      
      const { data: migratedSchedules, error: migrateError } = await supabase
        .from('workout_schedules')
        .insert(
          existingSchedules.map(schedule => ({
            user_id: schedule.user_id,
            workout_id: schedule.workout_id,
            scheduled_date: schedule.scheduled_date || new Date().toISOString(),
            completed: schedule.status === 'completed',
            created_at: schedule.created_at || new Date().toISOString(),
            updated_at: schedule.updated_at || new Date().toISOString()
          }))
        )
        .select();
      
      if (migrateError) {
        console.error('Error migrating schedules:', migrateError);
        return { success: false, error: migrateError };
      }
      
      console.log(`Successfully migrated ${migratedSchedules?.length || 0} schedules`);
      return { success: true, count: migratedSchedules?.length || 0 };
    }
    
    console.log('No schedules to migrate');
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Error in migrateWorkoutSchedules:', error);
    return { success: false, error };
  }
}

// You can run this function manually after the table is created
// Uncomment to run the migration:
// migrateWorkoutSchedules().then(console.log);
