-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the workout_schedules table
CREATE TABLE public.workout_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own workout schedules" 
  ON public.workout_schedules 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout schedules" 
  ON public.workout_schedules 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout schedules" 
  ON public.workout_schedules 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add a delete policy
CREATE POLICY "Users can delete their own workout schedules" 
  ON public.workout_schedules 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_workout_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_workout_schedules_updated_at
BEFORE UPDATE ON public.workout_schedules
FOR EACH ROW EXECUTE FUNCTION update_workout_schedules_updated_at();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_schedules_user_id ON public.workout_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedules_workout_id ON public.workout_schedules(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedules_scheduled_date ON public.workout_schedules(scheduled_date);

-- Grant necessary permissions
GRANT ALL ON TABLE public.workout_schedules TO authenticated;
GRANT ALL ON SEQUENCE public.workout_schedules_id_seq TO authenticated;
