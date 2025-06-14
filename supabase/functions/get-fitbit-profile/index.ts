
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Helper function to create responses
const createResponse = (
  body: unknown = null,
  status: number = 200,
  headers: Record<string, string> = {}
): Response => {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...corsHeaders,
    ...headers
  });

  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  
  return new Response(bodyString, {
    status,
    headers: responseHeaders
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
  return {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL') || '',
    SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') || '',
    FITBIT_CLIENT_ID: Deno.env.get('FITBIT_CLIENT_ID') || '',
    FITBIT_CLIENT_SECRET: Deno.env.get('FITBIT_CLIENT_SECRET') || '',
    SITE_URL: Deno.env.get('SITE_URL') || 'http://localhost:3000',
  };
}

// Get Fitbit access token
async function getFitbitAccessToken(supabase: any, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('fitbit_tokens')
    .select('access_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching Fitbit token:', error);
    return null;
  }

  // Check if token is expired
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data.access_token;
}

// Fetch data from Fitbit API
async function fetchFitbitData(accessToken: string, endpoint: string): Promise<any> {
  try {
    const response = await fetch(`https://api.fitbit.com/1/user/-/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
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

// Refresh Fitbit token
async function refreshFitbitToken(userId: string): Promise<any> {
  const env = getEnvVars();
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get the current refresh token
  const { data: tokenData, error: tokenError } = await supabase
    .from('fitbit_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (tokenError || !tokenData) {
    console.error('No refresh token found for user:', userId);
    return null;
  }

  // Exchange refresh token for new access token
  const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token
    })
  });

  if (!tokenResponse.ok) {
    console.error('Failed to refresh token:', await tokenResponse.text());
    return null;
  }

  const newTokenData = await tokenResponse.json();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (newTokenData.expires_in * 1000));

  // Update the tokens in the database
  const { data: updatedToken, error: updateError } = await supabase
    .from('fitbit_tokens')
    .update({
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating tokens:', updateError);
    return null;
  }

  return updatedToken;
}

// Main request handler
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse('', 204);
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    // Get environment variables
    const env = getEnvVars();
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse(401, 'Missing Authorization header');
    }

    // Initialize Supabase client
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: authHeader }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return createErrorResponse(401, 'Unauthorized');
    }

    // Get the access token
    let accessToken = await getFitbitAccessToken(supabase, user.id);
    
    // If no token or token is expired, try to refresh it
    if (!accessToken) {
      const newToken = await refreshFitbitToken(user.id);
      if (!newToken) {
        return createErrorResponse(401, 'Fitbit not connected or session expired');
      }
      accessToken = newToken.access_token;
    }

    // Fetch the user's profile from Fitbit
    const profile = await fetchFitbitData(accessToken, 'profile.json');
    
    // Return the profile data
    return createResponse(profile);

  } catch (error) {
    console.error('Error in get Fitbit profile handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, 'Failed to fetch Fitbit profile', errorMessage);
  }
});
