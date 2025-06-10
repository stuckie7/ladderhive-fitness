
-- Create a comprehensive user statistics view/table for better performance
CREATE TABLE IF NOT EXISTS public.user_workout_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_workouts INTEGER DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  weekly_workouts INTEGER DEFAULT 0,
  monthly_workouts INTEGER DEFAULT 0,
  quarterly_workouts INTEGER DEFAULT 0,
  yearly_workouts INTEGER DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.user_workout_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout statistics" 
  ON public.user_workout_statistics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout statistics" 
  ON public.user_workout_statistics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout statistics" 
  ON public.user_workout_statistics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Add RLS policies for achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_workout_statistics(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_workouts INTEGER;
  v_total_calories INTEGER;
  v_total_minutes INTEGER;
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_completion_rate DECIMAL(5,2);
  v_weekly_workouts INTEGER;
  v_monthly_workouts INTEGER;
  v_quarterly_workouts INTEGER;
  v_yearly_workouts INTEGER;
  v_last_workout_date DATE;
  v_streak_count INTEGER := 0;
  v_previous_date DATE;
  v_current_date DATE;
  workout_record RECORD;
BEGIN
  -- Calculate total workouts from workout history
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(calories_burned), 0),
    COALESCE(SUM(duration_minutes), 0),
    MAX(date)
  INTO v_total_workouts, v_total_calories, v_total_minutes, v_last_workout_date
  FROM workout_history 
  WHERE user_id = p_user_id;

  -- Calculate completion rate (assuming daily goal of 1 workout)
  -- This is a simplified calculation - you might want to make it more sophisticated
  IF v_total_workouts > 0 THEN
    v_completion_rate := LEAST(100.0, (v_total_workouts::DECIMAL / GREATEST(1, EXTRACT(DAYS FROM (CURRENT_DATE - (SELECT MIN(date) FROM workout_history WHERE user_id = p_user_id)))::INTEGER) * 100));
  ELSE
    v_completion_rate := 0.0;
  END IF;

  -- Calculate current streak by checking consecutive workout days
  v_current_streak := 0;
  v_longest_streak := 0;
  v_streak_count := 0;
  v_previous_date := CURRENT_DATE + INTERVAL '1 day'; -- Initialize to future date
  
  FOR workout_record IN 
    SELECT DISTINCT date 
    FROM workout_history 
    WHERE user_id = p_user_id 
    ORDER BY date DESC
  LOOP
    v_current_date := workout_record.date;
    
    -- Check if this date is consecutive to the previous one
    IF v_previous_date = v_current_date + INTERVAL '1 day' OR v_previous_date = CURRENT_DATE + INTERVAL '1 day' THEN
      v_streak_count := v_streak_count + 1;
      IF v_previous_date = CURRENT_DATE + INTERVAL '1 day' THEN
        v_current_streak := v_streak_count;
      END IF;
    ELSE
      -- Streak broken, reset if not at the beginning
      IF v_previous_date != CURRENT_DATE + INTERVAL '1 day' THEN
        v_longest_streak := GREATEST(v_longest_streak, v_streak_count);
        v_streak_count := 1;
        v_current_streak := 0; -- Current streak is broken
      END IF;
    END IF;
    
    v_previous_date := v_current_date;
  END LOOP;
  
  v_longest_streak := GREATEST(v_longest_streak, v_streak_count);

  -- Calculate time-based workout counts
  SELECT COUNT(*) INTO v_weekly_workouts
  FROM workout_history 
  WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COUNT(*) INTO v_monthly_workouts
  FROM workout_history 
  WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '30 days';

  SELECT COUNT(*) INTO v_quarterly_workouts
  FROM workout_history 
  WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '90 days';

  SELECT COUNT(*) INTO v_yearly_workouts
  FROM workout_history 
  WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '365 days';

  -- Insert or update statistics
  INSERT INTO user_workout_statistics (
    user_id, total_workouts, total_calories, total_minutes, current_streak, longest_streak,
    completion_rate, weekly_workouts, monthly_workouts, quarterly_workouts, yearly_workouts,
    last_workout_date, updated_at
  ) VALUES (
    p_user_id, v_total_workouts, v_total_calories, v_total_minutes, v_current_streak, v_longest_streak,
    v_completion_rate, v_weekly_workouts, v_monthly_workouts, v_quarterly_workouts, v_yearly_workouts,
    v_last_workout_date, NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_workouts = EXCLUDED.total_workouts,
    total_calories = EXCLUDED.total_calories,
    total_minutes = EXCLUDED.total_minutes,
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    completion_rate = EXCLUDED.completion_rate,
    weekly_workouts = EXCLUDED.weekly_workouts,
    monthly_workouts = EXCLUDED.monthly_workouts,
    quarterly_workouts = EXCLUDED.quarterly_workouts,
    yearly_workouts = EXCLUDED.yearly_workouts,
    last_workout_date = EXCLUDED.last_workout_date,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update statistics when workout history changes
CREATE OR REPLACE FUNCTION trigger_update_user_workout_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_user_workout_statistics(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM update_user_workout_statistics(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS update_stats_on_workout_history_change ON workout_history;
CREATE TRIGGER update_stats_on_workout_history_change
  AFTER INSERT OR UPDATE OR DELETE ON workout_history
  FOR EACH ROW EXECUTE FUNCTION trigger_update_user_workout_statistics();

-- Add unique constraint to prevent duplicate user statistics
ALTER TABLE user_workout_statistics ADD CONSTRAINT unique_user_statistics UNIQUE (user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_workout_statistics_user_id ON user_workout_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_user_date ON workout_history(user_id, date DESC);
