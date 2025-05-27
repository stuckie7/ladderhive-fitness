import { supabase } from '@/lib/supabase';
import { AdminAuditLog, AdminUser, AdminWorkout, AdminWorkoutSchedule, AdminStats, UserWorkoutStats } from '@/types/admin';

export const adminService = {
  // Check if current user is admin
  isAdmin: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.role === 'admin';
  },

  // Get all users (admin only)
  getUsers: async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  // Get user by ID (admin only)
  getUser: async (userId: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all workouts with user info (admin only)
  getWorkouts: async (): Promise<AdminWorkout[]> => {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        user:user_id (id, email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all workout schedules with user and workout info (admin only)
  getWorkoutSchedules: async (): Promise<AdminWorkoutSchedule[]> => {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select(`
        *,
        user:user_id (id, email, full_name),
        workout:workout_id (id, name)
      `)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a workout for a specific user (admin only)
  createUserWorkout: async (userId: string, workoutData: any): Promise<AdminWorkout> => {
    const { data, error } = await supabase
      .from('workouts')
      .insert([
        {
          ...workoutData,
          user_id: userId,
          is_admin_suggested: true,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Log the admin action
    await supabase.rpc('log_admin_action', {
      action: 'create_workout',
      target_user_id: userId,
      metadata: { workout_id: data.id }
    });

    return data;
  },

  // Update a user's workout (admin only)
  updateUserWorkout: async (workoutId: string, updates: any): Promise<AdminWorkout> => {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;

    // Log the admin action
    await supabase.rpc('log_admin_action', {
      action: 'update_workout',
      target_user_id: data.user_id,
      metadata: { workout_id: workoutId, updates }
    });

    return data;
  },

  // Delete a user's workout (admin only)
  deleteUserWorkout: async (workoutId: string): Promise<void> => {
    // First get the workout to log the user ID
    const { data: workout } = await supabase
      .from('workouts')
      .select('user_id')
      .eq('id', workoutId)
      .single();

    if (!workout) throw new Error('Workout not found');

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;

    // Log the admin action
    await supabase.rpc('log_admin_action', {
      action: 'delete_workout',
      target_user_id: workout.user_id,
      metadata: { workout_id: workoutId }
    });
  },

  // Schedule a workout for a user (admin only)
  scheduleUserWorkout: async (userId: string, scheduleData: any): Promise<AdminWorkoutSchedule> => {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([
        {
          ...scheduleData,
          user_id: userId,
          is_admin_assigned: true,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Log the admin action
    await supabase.rpc('log_admin_action', {
      action: 'schedule_workout',
      target_user_id: userId,
      metadata: { 
        schedule_id: data.id,
        workout_id: scheduleData.workout_id,
        scheduled_date: scheduleData.scheduled_date
      }
    });

    return data;
  },

  // Get admin dashboard stats
  getDashboardStats: async (): Promise<AdminStats> => {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('users')
      .gt('last_sign_in_at', thirtyDaysAgo.toISOString())
      .select('*', { count: 'exact', head: true });

    // Get total workouts
    const { count: totalWorkouts } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true });

    // Get admin-created workouts
    const { count: adminWorkouts } = await supabase
      .from('workouts')
      .eq('is_admin_suggested', true)
      .select('*', { count: 'exact', head: true });

    // Get total schedules
    const { count: totalSchedules } = await supabase
      .from('workout_schedules')
      .select('*', { count: 'exact', head: true });

    // Get recent audit logs
    const { data: recentAuditLogs } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalWorkouts: totalWorkouts || 0,
      adminWorkouts: adminWorkouts || 0,
      totalSchedules: totalSchedules || 0,
      recentAuditLogs: recentAuditLogs || []
    };
  },

  // Get user workout statistics
  getUserWorkoutStats: async (): Promise<UserWorkoutStats[]> => {
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, last_sign_in_at');

    if (!users) return [];

    const stats = await Promise.all(
      users.map(async (user) => {
        const { count: workoutCount } = await supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: scheduleCount } = await supabase
          .from('workout_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          userId: user.id,
          email: user.email || '',
          fullName: user.full_name,
          workoutCount: workoutCount || 0,
          scheduleCount: scheduleCount || 0,
          lastActive: user.last_sign_in_at
        };
      })
    );

    return stats;
  },

  // Get audit logs
  getAuditLogs: async (limit = 50): Promise<AdminAuditLog[]> => {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};
