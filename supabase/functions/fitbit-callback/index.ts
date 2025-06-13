import { createClient } from '@supabase/supabase-js';
import { corsHeaders, withCors, createCorsResponse } from '../_shared/cors';

// Environment variables - these will be provided by Supabase Edge Functions
const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  FITBIT_CLIENT_ID: process.env.FITBIT_CLIENT_ID || '',
  FITBIT_CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET || '',
  SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

// In-memory store for OAuth state (in production, consider using Redis or similar)
const oauthStateStore = new Map<string, { userId: string; expiresAt: number }>();

// Extend the global Request and Response types
interface FetchResponse extends Response {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare const fetch: (input: string | URL | Request, init?: RequestInit) => Promise<FetchResponse>;
declare const btoa: (str: string) => string;

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
  } as HeadersInit);

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

// Helper to parse URL parameters
const parseUrlParams = (url: string): Record<string, string> => {
  const params = new URL(url).searchParams;
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// Main request handler for Supabase Edge Functions
export default async (req: any): Promise<Response> => {
  // Handle CORS preflight
  const method = req.method || 'GET';
  const url = req.url || '';
  
  if (method === 'OPTIONS') {
    return createResponse('', 204);
  }

  // Only allow GET requests for OAuth callback
  if (method !== 'GET') {
    return createErrorResponse(405, 'Method not allowed');
  }

  try {
    // Parse the URL to get query parameters
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    const error = urlObj.searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return createErrorResponse(400, 'OAuth error', error);
    }

    // Validate required parameters
    if (!code || !state) {
      return createErrorResponse(400, 'Missing required parameters', 'Both code and state are required');
    }

    // Verify state to prevent CSRF attacks
    const stateData = oauthStateStore.get(state);
    if (!stateData) {
      return createErrorResponse(400, 'Invalid or expired state parameter');
    }
    
    // Clean up the used state
    oauthStateStore.delete(state);
    
    // Check if state has expired
    if (Date.now() > stateData.expiresAt) {
      return createErrorResponse(400, 'State has expired');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`)
      },
      body: new URLSearchParams({
        client_id: env.FITBIT_CLIENT_ID,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${env.SITE_URL}/api/auth/callback`
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Error exchanging code for token:', error);
      return createErrorResponse(500, 'Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Initialize Supabase admin client (bypasses RLS)
    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // No authorization header check needed for OAuth callback

    // Get the current timestamp and calculate expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (tokenData.expires_in * 1000));
    
    // Store the tokens in the database
    const { data, error: dbError } = await supabase
      .from('fitbit_tokens')
      .upsert({
        user_id: stateData.userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokenData.scope
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing tokens:', dbError);
      return createErrorResponse(500, 'Failed to store tokens');
    }

    // Redirect back to the app with success message
    const redirectUrl = new URL(env.SITE_URL);
    redirectUrl.searchParams.set('fitbit_connected', 'true');
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error in Fitbit callback handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(500, 'Internal server error', errorMessage);
  }
};
