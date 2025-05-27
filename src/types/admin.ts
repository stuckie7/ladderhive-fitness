
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
