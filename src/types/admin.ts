// Basic user type that matches the expected structure
export interface User {
  id: string;
  email?: string;
  full_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Basic workout type
export interface Workout {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Basic workout schedule type
export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

export interface AdminUser extends User {
  email?: string;
  role?: string;
  last_sign_in_at?: string;
}

export interface AdminWorkout extends Workout {
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface AdminWorkoutSchedule extends WorkoutSchedule {
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

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_user_id: string;
  target_user_id?: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export interface UserSuggestedWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  suggested_by_admin: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  workout?: any;
}

export interface AdminScheduledWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  scheduled_date: string;
  scheduled_by_admin?: string;
  status: string;
  admin_message?: string;
  created_at: string;
  workout?: any;
}

export interface UserSavedWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  saved_by_admin?: string;
  admin_message?: string;
  created_at: string;
  workout?: any;
}
