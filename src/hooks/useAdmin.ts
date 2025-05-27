
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserRole, AdminAction, UserSuggestedWorkout, AdminScheduledWorkout } from '@/types/admin';

export const useAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (
    actionType: string,
    entityType: string,
    entityId?: string,
    targetUserId?: string,
    details?: any
  ) => {
    if (!user || !isAdmin) return;

    try {
      await supabase.from('admin_actions').insert({
        admin_user_id: user.id,
        target_user_id: targetUserId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const suggestWorkoutToUser = async (
    userId: string,
    workoutId: string,
    message?: string,
    expiresAt?: string
  ) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin permissions",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_suggested_workouts')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          suggested_by_admin: user!.id,
          message,
          expires_at: expiresAt
        });

      if (error) throw error;

      await logAdminAction('suggest_workout', 'workout', workoutId, userId, { message });

      toast({
        title: "Success",
        description: "Workout suggested to user successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error suggesting workout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to suggest workout",
        variant: "destructive"
      });
      return false;
    }
  };

  const scheduleWorkoutForUser = async (
    userId: string,
    workoutId: string,
    scheduledDate: string,
    adminMessage?: string
  ) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin permissions",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('scheduled_workouts')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          scheduled_date: scheduledDate,
          scheduled_by_admin: user!.id,
          admin_message: adminMessage
        });

      if (error) throw error;

      await logAdminAction('schedule_workout', 'workout', workoutId, userId, { 
        scheduled_date: scheduledDate,
        admin_message: adminMessage 
      });

      toast({
        title: "Success",
        description: "Workout scheduled for user successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error scheduling workout:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule workout",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveWorkoutForUser = async (
    userId: string,
    workoutId: string,
    adminMessage?: string
  ) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin permissions",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_saved_workouts')
        .insert({
          user_id: userId,
          workout_id: workoutId,
          saved_by_admin: user!.id,
          admin_message: adminMessage
        });

      if (error) throw error;

      await logAdminAction('save_workout', 'workout', workoutId, userId, { admin_message: adminMessage });

      toast({
        title: "Success",
        description: "Workout saved for user successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error saving workout for user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save workout for user",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateWorkoutFlags = async (
    workoutId: string,
    flags: {
      admin_suggested?: boolean;
      admin_featured?: boolean;
      admin_priority?: number;
    }
  ) => {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You don't have admin permissions",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('prepared_workouts')
        .update(flags)
        .eq('id', workoutId);

      if (error) throw error;

      await logAdminAction('update_workout_flags', 'workout', workoutId, undefined, flags);

      toast({
        title: "Success",
        description: "Workout flags updated successfully"
      });

      return true;
    } catch (error: any) {
      console.error('Error updating workout flags:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update workout flags",
        variant: "destructive"
      });
      return false;
    }
  };

  const getUsers = async () => {
    if (!isAdmin) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const getAdminActions = async (limit = 50) => {
    if (!isAdmin) return [];

    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      return [];
    }
  };

  return {
    isAdmin,
    loading,
    suggestWorkoutToUser,
    scheduleWorkoutForUser,
    saveWorkoutForUser,
    updateWorkoutFlags,
    getUsers,
    getAdminActions,
    logAdminAction
  };
};
