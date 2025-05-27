-- Create suggested_workouts table
CREATE TABLE IF NOT EXISTS public.suggested_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL, -- in minutes
  category TEXT,
  target_muscles TEXT[],
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.suggested_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for suggested_workouts
CREATE POLICY "Enable read access for all users" 
ON public.suggested_workouts 
FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "Enable insert for admins"
ON public.suggested_workouts
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated' AND 
           EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'));

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_suggested_workouts_updated_at
BEFORE UPDATE ON public.suggested_workouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data
INSERT INTO public.suggested_workouts (
  name, 
  description, 
  difficulty, 
  duration, 
  category, 
  target_muscles,
  image_url
) VALUES 
('Morning Cardio Blast', 'High-intensity cardio to start your day', 'intermediate', 30, 'cardio', '{"full_body"}', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),
('Full Body Strength', 'Build strength with compound movements', 'beginner', 45, 'strength', '{"chest","back","legs","shoulders"}', 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c'),
('Core & Abs', 'Sculpt your core with these targeted exercises', 'intermediate', 20, 'core', '{"abs","obliques","lower_back"}', 'https://images.unsplash.com/photo-1535914254983-b041535a1ba3'),
('Yoga Flow', 'Relaxing yoga session for flexibility and mindfulness', 'beginner', 60, 'yoga', '{"full_body","flexibility"}', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'),
('HIIT Workout', 'High-intensity interval training for maximum calorie burn', 'advanced', 25, 'hiit', '{"full_body","cardio"}', 'https://images.unsplash.com/photo-1571019614244-8123e0f6f0c9'),
('Upper Body Burn', 'Target your upper body with this intense workout', 'intermediate', 40, 'strength', '{"chest","back","shoulders","arms"}', 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3'),
('Lower Body Power', 'Build strong legs and glutes', 'intermediate', 35, 'strength', '{"quads","hamstrings","glutes","calves"}', 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c'),
('Stretch & Mobility', 'Improve flexibility and range of motion', 'beginner', 20, 'mobility', '{"full_body","flexibility"}', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'),
('Pilates Core', 'Strengthen your core with controlled movements', 'intermediate', 30, 'pilates', '{"abs","back","hips"}', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),
('Tabata Sprint', 'Short, intense intervals for maximum results', 'advanced', 20, 'hiit', '{"full_body","cardio"}', 'https://images.unsplash.com/photo-1571019614244-8123e0f6f0c9')
ON CONFLICT (name) DO NOTHING;

-- Create an index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_suggested_workouts_difficulty ON public.suggested_workouts(difficulty);
CREATE INDEX IF NOT EXISTS idx_suggested_workouts_category ON public.suggested_workouts(category);
CREATE INDEX IF NOT EXISTS idx_suggested_workouts_duration ON public.suggested_workouts(duration);

-- Grant necessary permissions
GRANTANT SELECT ON public.suggested_workouts TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.suggested_workouts TO authenticated;

-- Create a view for suggested workouts with additional metadata
CREATE OR REPLACE VIEW public.vw_suggested_workouts AS
SELECT 
  sw.*,
  (
    SELECT COUNT(*) 
    FROM public.workout_schedules 
    WHERE workout_id = sw.id
  ) AS times_scheduled,
  (
    SELECT AVG(rating) 
    FROM public.workout_feedback 
    WHERE workout_id = sw.id
  ) AS average_rating
FROM public.suggested_workouts sw;

-- Grant permissions on the view
GRANT SELECT ON public.vw_suggested_workouts TO authenticated, anon;
