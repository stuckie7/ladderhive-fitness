import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fitbit API credentials
const fitbitClientId = process.env.FITBIT_CLIENT_ID || '';
const fitbitClientSecret = process.env.FITBIT_CLIENT_SECRET || '';

// Types
interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
  scope: string;
  token_type: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean } | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed'
    });
  }

  const { code, state, error: oauthError } = req.query;

  // Check for OAuth errors
  if (oauthError) {
    return res.status(400).json({
      error: 'OAuth Error',
      message: `Failed to authorize with Fitbit: ${oauthError}`
    });
  }

  // Verify we have the required parameters
  if (!code || !state) {
    return res.status(400).json({
      error: 'Missing parameters',
      message: 'Missing required OAuth parameters: code and state are required'
    });
  }

  try {
    // Decode and validate the state parameter
    let userId: string;
    try {
      const stateObj = JSON.parse(decodeURIComponent(state as string));
      userId = stateObj.userId;
      
      if (!userId) {
        throw new Error('User ID not found in state');
      }
    } catch (stateError) {
      return res.status(400).json({
        error: 'Invalid state',
        message: 'The state parameter is invalid or corrupted'
      });
    }

    // Exchange the authorization code for an access token
    const tokenUrl = 'https://api.fitbit.com/oauth2/token';
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback/fitbit`;
    const basicAuth = Buffer.from(`${fitbitClientId}:${fitbitClientSecret}`).toString('base64');
    
    const tokenParams = new URLSearchParams();
    tokenParams.append('clientId', fitbitClientId);
    tokenParams.append('code', code as string);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('redirect_uri', redirectUri);

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Fitbit token exchange error:', errorData);
      throw new Error(`Failed to exchange authorization code for access token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json() as FitbitTokenResponse;

    // Store the tokens in the database
    const { error: dbError } = await supabase
      .from('fitbit_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        scope: tokenData.scope,
        fitbit_user_id: tokenData.user_id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store Fitbit tokens');
    }

    // Update user's connection status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        fitbit_connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the whole flow if profile update fails
    }

    // Return success response for the popup
    return res.status(200).json({
      success: true,
      message: 'Successfully connected Fitbit account',
      fitbit_user_id: tokenData.user_id
    });

  } catch (error) {
    console.error('Fitbit callback error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}
