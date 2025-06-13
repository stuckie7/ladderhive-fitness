import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  error: string;
  details?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Generate a random state for CSRF protection
    const state = uuidv4();
    
    // Store the state in the database with expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const { error: stateError } = await supabase
      .from('fitbit_auth_states')
      .insert({
        user_id: session.user.id,
        state: state,
        expires_at: expiresAt.toISOString()
      });

    if (stateError) {
      console.error('Error storing state:', stateError);
      return res.status(500).json({ error: 'Failed to store OAuth state', details: stateError.message });
    }
    
    console.log('Stored OAuth state in database:', { state, userId: session.user.id, expiresAt });

    // Create the authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      scope: 'activity heartrate location nutrition profile settings sleep social weight',
      state,
      expires_in: '604800', // 7 days
    });

    const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
    
    res.status(200).json({ url: authUrl });
  } catch (error) {
    console.error('Error in Fitbit connect endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const response: ErrorResponse = { 
      error: 'Failed to connect to Fitbit',
      details: errorMessage
    };
    res.status(500).json(response);
  }
}
