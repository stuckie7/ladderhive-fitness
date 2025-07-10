import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;
    const fitbitClientId = process.env.FITBIT_CLIENT_ID;
    const fitbitClientSecret = process.env.FITBIT_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fittrackpro.lovable.app'}/api/auth/callback/fitbit`;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    // Store the state in the database for verification later
    const { error: stateError } = await supabase
      .from('fitbit_auth_states')
      .upsert(
        { user_id: userId, state, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() },
        { onConflict: 'user_id' }
      );

    if (stateError) {
      console.error('Error storing state:', stateError);
      return res.status(500).json({ error: 'Failed to start OAuth flow' });
    }

    // Redirect to Fitbit authorization page
    const authUrl = new URL('https://www.fitbit.com/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', fitbitClientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'activity heartrate location nutrition profile settings sleep social weight');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', 'challenge'); // Add PKCE support later
    authUrl.searchParams.append('code_challenge_method', 'plain');

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error('Fitbit OAuth error:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
}
