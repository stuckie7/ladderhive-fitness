-- Create exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    equipment VARCHAR(255),
    difficulty VARCHAR(20),
    muscle_groups TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample exercises
INSERT INTO exercises (name, description, equipment, difficulty, muscle_groups) VALUES
('Push-up', 'Classic bodyweight push-up', 'bodyweight', 'beginner', ARRAY['chest', 'triceps', 'shoulders']),
('Squat', 'Bodyweight squat', 'bodyweight', 'beginner', ARRAY['quads', 'glutes', 'hamstrings']),
('Deadlift', 'Barbell deadlift', 'dumbbells', 'intermediate', ARRAY['back', 'legs', 'core']),
('Bench Press', 'Dumbbell bench press', 'dumbbells', 'intermediate', ARRAY['chest', 'triceps', 'shoulders']),
('Pull-up', 'Bodyweight pull-up', 'bodyweight', 'advanced', ARRAY['back', 'biceps', 'shoulders']),
('Clean and Press', 'Dumbbell clean and press', 'dumbbells', 'advanced', ARRAY['shoulders', 'legs', 'core']),
('Plank', 'Bodyweight plank', 'bodyweight', 'beginner', ARRAY['core']),
('Lunges', 'Bodyweight lunges', 'bodyweight', 'beginner', ARRAY['legs', 'glutes']),
('Bicep Curl', 'Dumbbell bicep curl', 'dumbbells', 'beginner', ARRAY['biceps']),
('Shoulder Press', 'Dumbbell shoulder press', 'dumbbells', 'intermediate', ARRAY['shoulders', 'triceps']),
('Russian Twist', 'Bodyweight Russian twist', 'bodyweight', 'beginner', ARRAY['core']),
('Mountain Climbers', 'Bodyweight mountain climbers', 'bodyweight', 'intermediate', ARRAY['core', 'legs']),
('Renegade Row', 'Dumbbell renegade row', 'dumbbells', 'advanced', ARRAY['back', 'core', 'shoulders']),
('Burpees', 'Bodyweight burpees', 'bodyweight', 'advanced', ARRAY['full body']),
('Farmer''s Walk', 'Dumbbell farmer''s walk', 'dumbbells', 'intermediate', ARRAY['grip', 'core', 'legs']);
