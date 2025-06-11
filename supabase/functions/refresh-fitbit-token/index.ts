// Import from deps.ts for better dependency management
import { 
  deno, 
  createClient, 
  corsHeaders, 
  getEnvVars,
  type SupabaseClient
} from '../deps.js';

const { serve } = deno;

// Simple response helper
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

// Main request handler
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse('', 204);
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Get the current refresh token from the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('fitbit_tokens')
      .select('refresh_token')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return createErrorResponse(400, 'No Fitbit tokens found for user');
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
      const error = await tokenResponse.text();
      console.error('Error refreshing token:', error);
      
      // If refresh token is invalid, delete it from the database
      if (tokenResponse.status === 400 || tokenResponse.status === 401) {
        await supabase
          .from('fitbit_tokens')
          .delete()
          .eq('user_id', user.id);
          
        return createErrorResponse(401, 'Refresh token invalid. Please reconnect your Fitbit account.');
      }
      
      return createErrorResponse(500, 'Failed to refresh token');
    }

    const newTokenData = await tokenResponse.json();
    
    // Calculate new expiration time
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (newTokenData.expires_in * 1000));
    
    // Update the tokens in the database
    const { data: updatedToken, error: updateError } = await supabase
      .from('fitbit_tokens')
      .update({
        access_token: newTokenData.access_token,
        refresh_token: newTokenData.refresh_token || tokenData.refresh_token, // Use new refresh token if provided
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating tokens:', updateError);
      return createErrorResponse(500, 'Failed to update tokens');
    }

    // Return the new token data
    return createResponse({
      access_token: updatedToken.access_token,
      expires_at: updatedToken.expires_at,
      scope: updatedToken.scope
    });

  } catch (error) {
    console.error('Error in refresh token handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, 'Internal server error', errorMessage);
  }
});
