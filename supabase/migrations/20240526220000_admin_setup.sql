-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;

-- Create admin role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END $$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin());

-- Workouts table policies
CREATE POLICY "Users can view their own workouts"
  ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view admin-suggested workouts"
  ON public.workouts
  FOR SELECT
  USING (is_admin_suggested = true);

CREATE POLICY "Users can manage their own workouts"
  ON public.workouts
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all workouts"
  ON public.workouts
  FOR ALL
  USING (public.is_admin());

-- Workout schedules table policies
CREATE POLICY "Users can view their own schedules"
  ON public.workout_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own schedules"
  ON public.workout_schedules
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all schedules"
  ON public.workout_schedules
  FOR ALL
  USING (public.is_admin());

-- Admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.admin_audit_logs
  FOR ALL
  USING (public.is_admin());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action text,
  target_user_id uuid DEFAULT NULL,
  metadata jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (admin_id, action, target_user_id, metadata)
  VALUES (auth.uid(), action, target_user_id, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
