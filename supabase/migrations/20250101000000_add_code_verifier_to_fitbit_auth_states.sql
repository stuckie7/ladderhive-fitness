-- Add code_verifier column to fitbit_auth_states table
ALTER TABLE public.fitbit_auth_states
ADD COLUMN IF NOT EXISTS code_verifier TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.fitbit_auth_states.code_verifier IS 'PKCE code verifier for OAuth 2.0 authorization code flow with PKCE';
