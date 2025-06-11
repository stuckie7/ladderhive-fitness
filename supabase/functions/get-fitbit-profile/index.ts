// Import from deps.ts for better dependency management
import { 
  deno, 
  createClient, 
  corsHeaders, 
  getEnvVars,
  type SupabaseClient
} from '../deps.js';
import { getFitbitAccessToken, fetchFitbitData, refreshFitbitToken } from '../fitbit-utils.js';

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
