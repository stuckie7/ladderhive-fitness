import { supabase } from '@/lib/supabase';
import { AdminAuditLog, AdminUser, AdminWorkout, AdminWorkoutSchedule, AdminStats, UserWorkoutStats } from '@/types/admin';

type CreateUserData = {
  email: string;
  password: string;
  full_name: string;
  role: string;
  email_verified?: boolean;
};

type CreateWorkoutData = {
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  category: string;
  instructions: string;
  is_public: boolean;
  created_by: string;
};

type ScheduleWorkoutData = {
  userId: string;
  workoutId: string;
  scheduledDate: string;
  notes?: string;
  createdBy?: string;
};

export const adminService = {
  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user;
  },

  // Check if current user is admin
  isAdmin: async (): Promise<boolean> => {
    try {
      const user = await adminService.getCurrentUser();
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserData) => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: userData.email_verified,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
      },
    });

    if (error) throw error;
    return data.user;
  },

  // Create a new workout template
  createWorkoutTemplate: async (workoutData: CreateWorkoutData) => {
    const { data, error } = await supabase
      .from('prepared_workouts')
      .insert([{
        title: workoutData.name,
        description: workoutData.description,
        duration_minutes: workoutData.duration,
        difficulty: workoutData.difficulty,
        category: workoutData.category,
        instructions: workoutData.instructions,
        is_template: workoutData.is_public,
        user_id: workoutData.created_by,
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Schedule a workout for a user
  scheduleWorkout: async (scheduleData: ScheduleWorkoutData) => {
    const { data, error } = await supabase
      .from('scheduled_workouts')
      .insert([{
        user_id: scheduleData.userId,
        workout_id: scheduleData.workoutId,
        scheduled_date: scheduleData.scheduledDate,
        admin_message: scheduleData.notes || '',
        status: 'scheduled',
        scheduled_by_admin: scheduleData.createdBy,
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users (admin only)
  getUsers: async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  // Get user by ID (admin only)
  getUser: async (userId: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all workouts with user info (admin only)
  getWorkouts: async (): Promise<AdminWorkout[]> => {
    const { data, error } = await supabase
      .from('prepared_workouts')
      .select(`
        *
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all workout schedules with user and workout info (admin only)
  getWorkoutSchedules: async (): Promise<AdminWorkoutSchedule[]> => {
    const { data, error } = await supabase
      .from('scheduled_workouts')
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
    const currentUser = await adminService.getCurrentUser();
    const { data, error } = await supabase
      .from('prepared_workouts')
      .insert([
        {
          ...workoutData,
          user_id: userId,
          admin_suggested: true,
          created_by_admin: currentUser.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a user's workout (admin only)
  updateUserWorkout: async (workoutId: string, updates: any): Promise<AdminWorkout> => {
    const { data, error } = await supabase
      .from('prepared_workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a user's workout (admin only)
  deleteUserWorkout: async (workoutId: string): Promise<void> => {
    const { error } = await supabase
      .from('prepared_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
  },

  // Get admin dashboard stats
  getDashboardStats: async (): Promise<AdminStats> => {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Get total workouts
    const { count: totalWorkouts } = await supabase
      .from('prepared_workouts')
      .select('*', { count: 'exact', head: true });

    // Get admin-created workouts
    const { count: adminWorkouts } = await supabase
      .from('prepared_workouts')
      .select('*', { count: 'exact', head: true })
      .eq('admin_suggested', true);

    // Get total schedules
    const { count: totalSchedules } = await supabase
      .from('scheduled_workouts')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalWorkouts: totalWorkouts || 0,
      adminWorkouts: adminWorkouts || 0,
      totalSchedules: totalSchedules || 0,
      recentAuditLogs: []
    };
  },

  // Get user workout statistics
  getUserWorkoutStats: async (): Promise<UserWorkoutStats[]> => {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, updated_at');

    if (!users) return [];

    const stats = await Promise.all(
      users.map(async (user) => {
        const { count: workoutCount } = await supabase
          .from('prepared_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: scheduleCount } = await supabase
          .from('scheduled_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          userId: user.id,
          email: `user-${user.id.slice(0, 8)}@example.com`,
          fullName: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
          workoutCount: workoutCount || 0,
          scheduleCount: scheduleCount || 0,
          lastActive: user.updated_at
        };
      })
    );

    return stats;
  },

  // Get audit logs
  getAuditLogs: async (limit = 50): Promise<AdminAuditLog[]> => {
    return [];
  }
};
