-- Create workout_schedules table
CREATE TABLE IF NOT EXISTS public.workout_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES public.suggested_workouts(id) ON DELETE CASCADE NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workout_id, scheduled_date) -- Prevent duplicate assignments for the same day
);

-- Enable RLS
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_schedules
CREATE POLICY "Users can view their own workout schedules" 
ON public.workout_schedules
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update status of their own workout schedules"
ON public.workout_schedules
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all workout schedules"
ON public.workout_schedules
FOR ALL
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE id = auth.uid() 
  AND raw_user_meta_data->>'role' = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE id = auth.uid() 
  AND raw_user_meta_data->>'role' = 'admin'
));

-- Trigger to update updated_at column (assuming the function already exists from previous migration)
-- If not, uncomment and include the function definition:
/*
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

CREATE TRIGGER update_workout_schedules_updated_at
BEFORE UPDATE ON public.workout_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data (optional, for testing)
-- Ensure you have users and suggested_workouts in your DB first
-- Example: INSERT INTO public.workout_schedules (user_id, workout_id, scheduled_date) VALUES ('your_user_id', 'your_workout_id', '2024-06-01T09:00:00Z');
