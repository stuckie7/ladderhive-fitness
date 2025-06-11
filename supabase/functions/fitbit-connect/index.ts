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

// Define types for our application
interface FitbitAuthResponse {
  url: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// Create a simple in-memory store for OAuth state
const oauthStateStore = new Map<string, { userId: string; expiresAt: number }>();

// Helper function to generate a random string for OAuth state
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  // @ts-ignore - crypto is available in the Deno runtime
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper function to create error responses
const createErrorResponse = (
  status: number,
  message: string,
  details?: string
): Response => {
  const errorResponse: ErrorResponse = { error: message };
  if (details) errorResponse.details = details;
  
  return createResponse(errorResponse, status);
};

// Simple request handler with type annotations
serve(async (req: globalThis.Request): Promise<globalThis.Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return createResponse('', 204);
  }

  try {
    // Get environment variables
    const env = getEnvVars();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization') || '';
    
    // Initialize Supabase client
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { 
            Authorization: authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return createErrorResponse(401, 'Unauthorized', 'User not authenticated');
    }

    // Handle GET request to initiate OAuth flow
    if (req.method === 'GET') {
      // Generate a random state parameter for CSRF protection
      const state = generateRandomString(32);
      
      // Store the state with the user ID for validation in the callback
      oauthStateStore.set(state, {
        userId: user.id,
        expiresAt: Date.now() + 3600000 // 1 hour expiration
      });

      // Create the Fitbit authorization URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: env.FITBIT_CLIENT_ID,
        redirect_uri: `${env.SITE_URL}/api/auth/callback`,
        scope: 'activity heartrate location nutrition profile settings sleep social weight',
        state,
        expires_in: '604800' // 7 days
      });

      const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
      
      // Return the URL to the client
      return createResponse({ url: authUrl } as FitbitAuthResponse);
    }

    // Handle other HTTP methods
    return createErrorResponse(405, 'Method not allowed');

  } catch (error) {
    console.error('Error in Fitbit connect handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, 'Internal server error', errorMessage);
  }
});
