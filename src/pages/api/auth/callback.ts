import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

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

  const { code, state, error: oauthError } = req.query;

  // Handle OAuth errors
  if (oauthError) {
    console.error('OAuth error:', oauthError);
    return res.redirect(
      `/profile?error=${encodeURIComponent(oauthError as string)}`
    );
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('Missing required parameters:', { code, state });
    return res.redirect('/profile?error=missing_parameters');
  }

  try {
    // Get the current user's session from the token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.redirect('/sign-in?redirect_after_sign_in=/api/auth/callback');
    }

    // Forward the authorization code to our Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fitbit-callback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ code, state })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Error from callback function:', error);
      throw new Error('Failed to complete Fitbit connection');
    }

    // Redirect back to the profile page with success message
    return res.redirect('/profile?fitbit_connected=true');
  } catch (error) {
    console.error('Error in Fitbit callback:', error);
    return res.redirect(
      `/profile?error=${encodeURIComponent(
        error.message || 'Failed to connect Fitbit account'
      )}`
    );
  }
}
