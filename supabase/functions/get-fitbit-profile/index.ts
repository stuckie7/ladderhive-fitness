
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Helper function to create responses
const createResponse = (
  body: unknown = null,
  status: number = 200,
  headers: Record<string, string> = {}
): Response => {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...headers,
  });

  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

  return new Response(bodyString, {
    status,
    headers: responseHeaders,
  });
};

// Helper function to create error responses
const createErrorResponse = (
  status: number,
  message: string,
  details?: string
): Response => {
  const errorResponse = { error: message };
  if (details) (errorResponse as any).details = details;

  return createResponse(errorResponse, status);
};

// Get environment variables
function getEnvVars() {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const FITBIT_CLIENT_ID = Deno.env.get('FITBIT_CLIENT_ID');
  const FITBIT_CLIENT_SECRET = Deno.env.get('FITBIT_CLIENT_SECRET');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) {
    const missingVars = [
      !SUPABASE_URL && 'SUPABASE_URL',
      !SUPABASE_ANON_KEY && 'SUPABASE_ANON_KEY',
      !SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
      !FITBIT_CLIENT_ID && 'FITBIT_CLIENT_ID',
      !FITBIT_CLIENT_SECRET && 'FITBIT_CLIENT_SECRET',
    ].filter(Boolean).join(', ');
    console.error(`Missing required environment variables: ${missingVars}`);
    throw new Error(`Server configuration error: Missing required environment variables: ${missingVars}.`);
  }

  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    FITBIT_CLIENT_ID,
    FITBIT_CLIENT_SECRET,
  };
}

// Get Fitbit access token
async function getFitbitAccessToken(adminClient: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await adminClient
      .from('fitbit_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Fitbit token:', error);
      return null;
    }

    if (!data) {
      console.log('No Fitbit token found for user:', userId);
      return null; // No token found, needs refresh
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      console.log('Fitbit token expired for user:', userId, 'Expired at:', expiresAt);
      return null; // Token expired, needs refresh
    }

    console.log('Valid Fitbit token found for user:', userId);
    return data.access_token;
  } catch (error) {
    console.error('Unexpected error in getFitbitAccessToken:', error);
    return null;
  }
}

// Fetch data from Fitbit API
async function fetchFitbitData(accessToken: string, endpoint: string): Promise<any> {
  try {
    const response = await fetch(`https://api.fitbit.com/1/user/-/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fitbit API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);
    throw error;
  }
}

// Refresh Fitbit token (now with robust error handling)
async function refreshFitbitToken(adminClient: any, userId: string): Promise<any> {
  try {
    const env = getEnvVars();
    
    console.log('Attempting to refresh token for user:', userId);
    
    const { data: tokenData, error: tokenError } = await adminClient
      .from('fitbit_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (tokenError || !tokenData || !tokenData.refresh_token) {
      console.error('No valid refresh token found for user:', userId, 'Error:', tokenError);
      return null;
    }

    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Failed to refresh token from Fitbit API:', errorBody);
      if (errorBody.includes('invalid_grant')) {
        console.log('Refresh token is invalid. Deleting token record for user:', userId);
        await adminClient.from('fitbit_tokens').delete().eq('user_id', userId);
      }
      return null;
    }

    const newTokenData = await tokenResponse.json();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + newTokenData.expires_in * 1000);

    const { data: updatedToken, error: updateError } = await adminClient
      .from('fitbit_tokens')
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating token in database:', updateError);
      throw updateError;
    }

    console.log('Successfully refreshed and stored new token for user:', userId);
    return {
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Critical error in refreshFitbitToken:', error);
    return null;
  }
}

// Main request handler
serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!['GET', 'POST'].includes(req.method)) {
      return createErrorResponse(405, 'Method Not Allowed');
    }

    const env = getEnvVars();

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.error('No authorization token provided in headers');
      return createErrorResponse(401, 'Missing authentication token');
    }
    
    console.log('Received token for validation');

    // Create admin client to verify the token
    const adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the JWT token
    let user;
    try {
      const { data: userData, error: userError } = await adminClient.auth.getUser(token);
      
      if (userError || !userData.user) {
        console.error('User authentication failed:', userError?.message || 'No user found in token');
        return createErrorResponse(401, 'Unauthorized', userError?.message || 'Invalid user session');
      }
      
      user = userData.user;
      console.log('Successfully authenticated user:', user.id);
    } catch (authError) {
      console.error('Error during authentication:', authError);
      return createErrorResponse(401, 'Authentication failed', 'Invalid or expired token');
    }

    console.log('Authenticated user:', user.id);

    // Get the access token using the admin client
    let accessToken = await getFitbitAccessToken(adminClient, user.id);

    if (!accessToken) {
      console.log('Access token not found or expired, attempting refresh for user:', user.id);
      
      // Update refreshFitbitToken call to use admin client
      const newTokenData = await refreshFitbitToken(adminClient, user.id);

      if (!newTokenData || !newTokenData.access_token) {
        console.error('Failed to refresh token or refreshed token data is invalid for user:', user.id);
        return createErrorResponse(401, 'Fitbit not connected or session expired. Please reconnect.');
      }
      
      console.log('Token refreshed successfully for user:', user.id);
      accessToken = newTokenData.access_token;
    }

    if (!accessToken) {
      console.error('Critical error: Access token is invalid before calling fetchFitbitData. User ID:', user.id);
      return createErrorResponse(500, 'Internal server error: Invalid access token state.');
    }

        // Attempt to fetch profile but tolerate Fitbit rate-limit errors
    try {
      const profile = await fetchFitbitData(accessToken, 'profile.json');
      return createResponse(profile);
    } catch (fetchErr) {
      console.warn('Unable to fetch Fitbit profile (likely rate limit). Returning minimal success.');
      return createResponse({ connected: true });
    }
  } catch (error) {
    console.error('Unhandled error in get-fitbit-profile handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, 'Failed to fetch Fitbit profile', errorMessage);
  }
});
