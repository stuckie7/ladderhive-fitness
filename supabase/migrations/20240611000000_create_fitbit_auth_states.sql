
-- Create a table to store OAuth state for CSRF protection
CREATE TABLE IF NOT EXISTS public.fitbit_auth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.fitbit_auth_states ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can view their own auth states"
  ON public.fitbit_auth_states
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auth states"
  ON public.fitbit_auth_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for cleanup
CREATE INDEX idx_fitbit_auth_states_expires_at ON public.fitbit_auth_states(expires_at);

-- Function to clean up expired states
CREATE OR REPLACE FUNCTION cleanup_expired_auth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.fitbit_auth_states 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
