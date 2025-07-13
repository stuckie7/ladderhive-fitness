// Disable default JWT verification for this public callback endpoint
export const verifyJwt = false;
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables
const FITBIT_CLIENT_ID = Deno.env.get('FITBIT_CLIENT_ID');
const FITBIT_CLIENT_SECRET = Deno.env.get('FITBIT_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.fittrackprov1.com';
const HANDLER_REDIRECT_URI = `https://jrwyptpespjvjisrwnbh.supabase.co/functions/v1/fitbit-handler`;

console.log("fitbit-handler: Environment variables loaded:", {
  FITBIT_CLIENT_ID_SET: !!FITBIT_CLIENT_ID,
  FITBIT_CLIENT_SECRET_SET: !!FITBIT_CLIENT_SECRET,
  SUPABASE_URL_SET: !!SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY_SET: !!SUPABASE_SERVICE_ROLE_KEY,
  SITE_URL,
  HANDLER_REDIRECT_URI
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Supabase Admin Client Initialization
let supabaseAdminClient: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log("fitbit-handler: Supabase admin client initialized.");
} else {
  console.error("fitbit-handler: Supabase URL or Service Role Key missing. Client not initialized.");
}

// Helper to create basic auth header
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const base64 = btoa(unescape(encodeURIComponent(credentials)));
  return `Basic ${base64}`;
}

declare function btoa(input: string): string; // Deno provides this globally

// Helper to exchange auth code for tokens
async function exchangeCodeForToken(code: string, codeVerifier: string) {
  if (!FITBIT_CLIENT_ID || !FITBIT_CLIENT_SECRET) {
    throw new Error("Fitbit Client ID or Secret not configured.");
  }
  console.log('exchangeCodeForToken: Attempting to exchange code for token with Fitbit...');
  console.log({ codeReceivedLength: code?.length, codeVerifierReceivedLength: codeVerifier?.length });

  const tokenUrl = 'https://api.fitbit.com/oauth2/token';
  const authHeader = createBasicAuthHeader(FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET);
  
  const tokenRequestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: HANDLER_REDIRECT_URI,
    client_id: FITBIT_CLIENT_ID,
    code_verifier: codeVerifier,
  });
  
  console.log('Token request body being sent to Fitbit:', tokenRequestBody.toString());

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authHeader
    },
    body: tokenRequestBody.toString(),
  });

  const responseBodyText = await response.text();
  console.log('Fitbit token exchange response status:', response.status);
  console.log('Fitbit token exchange response body:', responseBodyText);

  if (!response.ok) {
    let fitbitError = responseBodyText;
    try {
      const parsedError = JSON.parse(responseBodyText);
      if (parsedError.errors && parsedError.errors.length > 0) {
        fitbitError = parsedError.errors.map((e: any) => `${e.errorType}: ${e.message}`).join(', ');
      }
    } catch (e) { /* Ignore if not JSON */ }
    throw new Error(`Token exchange with Fitbit failed: ${response.status} ${response.statusText} - Details: ${fitbitError}`);
  }
  
  return JSON.parse(responseBodyText);
}

// Helper function to create error responses
function createErrorResponse(error: string, origin: string): Response {
  console.error('Creating error response:', error);
  
  let redirectUrl: string;
  try {
    const baseUrl = origin.startsWith('http') ? origin : SITE_URL;
    const url = new URL('/profile', baseUrl);
    url.searchParams.set('status', 'error');
    url.searchParams.set('provider', 'fitbit');
    url.searchParams.set('error', encodeURIComponent(error));
    redirectUrl = url.toString();
  } catch (e) {
    console.error('Error constructing error URL:', e);
    redirectUrl = `${SITE_URL}/profile?status=error&provider=fitbit&error=authentication_failed`;
  }
  
  console.log('Redirecting to error URL:', redirectUrl);
  const responseHeaders = new Headers(corsHeaders);
  responseHeaders.set('Location', redirectUrl);
  
  return new Response(null, {
    status: 302,
    headers: responseHeaders
  });
}

serve(async (req: Request) => {
  console.log('=== New Request ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Set CORS headers for all responses
  const setCorsHeaders = (headers: Record<string, string> = {}) => {
    const allHeaders = {
      ...corsHeaders,
      ...headers
    };
    console.log('Setting response headers:', allHeaders);
    return allHeaders;
  };

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response('ok', { headers: setCorsHeaders() });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: setCorsHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // Parse URL and query parameters
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] fitbit-handler: Request: ${req.method} ${url.pathname}${url.search}`);

  // Extract query parameters
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  console.log('Received OAuth callback:', { 
    hasCode: !!code, 
    hasState: !!state, 
    error: errorParam 
  });

  // Handle OAuth errors
  if (errorParam) {
    const errorDescription = url.searchParams.get('error_description') || 'No description';
    console.error(`OAuth error: ${errorParam} - ${errorDescription}`);
    return createErrorResponse(`OAuth error: ${errorParam} - ${errorDescription}`, SITE_URL);
  }

  // Validate required parameters
  if (!code || !state) {
    const missing = [];
    if (!code) missing.push('code');
    if (!state) missing.push('state');
    const errorMsg = `Missing required parameters: ${missing.join(', ')}`;
    console.error(errorMsg);
    return createErrorResponse(errorMsg, SITE_URL);
  }

  try {
    // Parse state parameter
    let userId: string;
    let nonce: string;
    let origin: string;
    
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      userId = stateData.userId;
      nonce = stateData.nonce;
      origin = stateData.origin || SITE_URL;
      
      if (!userId || !nonce) {
        throw new Error('Invalid state: missing userId or nonce');
      }
      console.log('Parsed state:', { userId, nonce, origin });
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to parse state parameter');
      console.error('Error parsing state:', error);
      return createErrorResponse('Invalid state parameter', SITE_URL);
    }

    // Get code verifier from database
    if (!supabaseAdminClient) {
      throw new Error('Supabase admin client not initialized');
    }

    console.log('Fetching PKCE verifier for nonce:', nonce);
    const { data: pkceRow, error: pkceError } = await supabaseAdminClient
      .from('fitbit_pkce')
      .select('code_verifier')
      .eq('pkce_key', nonce)
      .single();

    if (pkceError || !pkceRow?.code_verifier) {
      console.error('PKCE verifier not found or DB error:', pkceError?.message || 'No code_verifier found');
      return createErrorResponse('Invalid or expired authentication request', origin);
    }

    const codeVerifier = pkceRow.code_verifier;
    console.log('Found code verifier, length:', codeVerifier?.length || 0);
    
    // Clean up PKCE record (best effort)
    try {
      await supabaseAdminClient
        .from('fitbit_pkce')
        .delete()
        .eq('pkce_key', nonce);
      console.log('Cleaned up PKCE record');
    } catch (e) {
      console.error('Error cleaning up PKCE record:', e);
      // Continue even if cleanup fails
    }

    // Exchange authorization code for tokens
    console.log('Exchanging code for tokens...');
    const tokenData = await exchangeCodeForToken(code, codeVerifier);
    console.log('Successfully obtained tokens from Fitbit');

    // Store tokens in database
    if (!supabaseAdminClient) {
      throw new Error('Supabase admin client not initialized');
    }

    const { error: upsertError } = await supabaseAdminClient
      .from('fitbit_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scope: tokenData.scope,
        fitbit_user_id: tokenData.user_id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      throw new Error(`Failed to store tokens: ${upsertError.message}`);
    }

    console.log('Tokens stored successfully');
    
    // Create success redirect URL
    let redirectUrl: string;
    try {
      const baseUrl = origin.startsWith('http') ? origin : SITE_URL;
      console.log('Creating redirect URL with base:', baseUrl);
      const url = new URL('/profile', baseUrl);
      url.searchParams.set('status', 'success');
      url.searchParams.set('provider', 'fitbit');
      redirectUrl = url.toString();
      console.log('Successfully created redirect URL:', redirectUrl);
    } catch (e) {
      console.error('Error constructing redirect URL, falling back to default:', e);
      redirectUrl = `${SITE_URL}/profile?status=success&provider=fitbit`;
      console.log('Using fallback redirect URL:', redirectUrl);
    }
    
    console.log('Final redirect URL:', redirectUrl);
    
    // Log the redirect URL for debugging
    console.log('Final redirect URL:', redirectUrl);
    
    // Create a simple redirect response with minimal headers
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Access-Control-Allow-Origin': '*', // Allow all origins for now
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
    
    // Log the response headers for debugging
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    return response;

  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return createErrorResponse(errorMessage, SITE_URL);
  }
});
