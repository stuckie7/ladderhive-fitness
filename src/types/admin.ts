import { Database } from '@/types/supabase';

export type AdminAuditLog = Database['public']['Tables']['admin_audit_logs']['Row'];

export interface AdminUser extends Database['public']['Tables']['users']['Row'] {
  email?: string;
}

export interface AdminWorkout extends Database['public']['Tables']['workouts']['Row'] {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface AdminWorkoutSchedule extends Database['public']['Tables']['workout_schedules']['Row'] {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  workout?: {
    id: string;
    name: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWorkouts: number;
  adminWorkouts: number;
  totalSchedules: number;
  recentAuditLogs: AdminAuditLog[];
}

export interface UserWorkoutStats {
  userId: string;
  email: string;
  fullName: string | null;
  workoutCount: number;
  scheduleCount: number;
  lastActive: string | null;
}
