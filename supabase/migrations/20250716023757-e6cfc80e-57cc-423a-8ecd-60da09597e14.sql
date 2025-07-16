-- Create fitbit_auth_states table if it doesn't exist for PKCE flow
CREATE TABLE IF NOT EXISTS public.fitbit_auth_states (
  user_id UUID PRIMARY KEY,
  state TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fitbit_auth_states ENABLE ROW LEVEL SECURITY;

-- Create policies for fitbit_auth_states
CREATE POLICY "Users can manage their own auth states" 
ON public.fitbit_auth_states 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);