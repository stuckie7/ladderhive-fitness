import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a secure random string for PKCE
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate code challenge from verifier
async function generateCodeChallenge(verifier: string) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return hash.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = Buffer.from(JSON.stringify({ 
      userId,
      codeVerifier
    })).toString('base64');

    // Store the state and code verifier in the database
    const { error: stateError } = await supabase
      .from('fitbit_auth_states')
      .upsert(
        { 
          user_id: userId, 
          state, 
          code_verifier: codeVerifier,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() 
        },
        { onConflict: 'user_id' }
      );

    if (stateError) {
      console.error('Error storing state:', stateError);
      return res.status(500).json({ error: 'Failed to start OAuth flow' });
    }

    // Build authorization URL
    const authUrl = new URL('https://www.fitbit.com/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.FITBIT_CLIENT_ID || '');
    authUrl.searchParams.append('redirect_uri', 'https://jrwyptpespjvjisrwnbh.supabase.co/functions/v1/fitbit-handler');
    authUrl.searchParams.append('scope', 'activity profile');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error('Fitbit OAuth error:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
}
