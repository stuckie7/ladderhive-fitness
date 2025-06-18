// Simple Fitbit OAuth 2.0 Connect Endpoint
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Helper function to create CORS headers
const createCorsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
});

// Helper function to create a response
const createResponse = (status: number, body: any, origin: string) => {
  const headers = {
    ...createCorsHeaders(origin),
    'Content-Type': 'application/json',
  };
  
  return new Response(
    JSON.stringify(body),
    { status, headers }
  );
};

// PKCE Helper: Generate a random string for the code verifier
const generateCodeVerifier = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// PKCE Helper: Generate the code challenge from the verifier
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Base64 URL encode
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'http://localhost:3000';
    const corsHeaders = createCorsHeaders(origin);
    return new Response('ok', { headers: corsHeaders });
  }

  // Use the request origin for CORS and state, with fallbacks.
  const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'http://localhost:3000';
  const corsHeaders = createCorsHeaders(origin);
  
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return createResponse(
        405,
        { error: 'Method not allowed' },
        origin
      );
    }

    // Get environment variables
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    let siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';
    
    // Ensure the protocol matches the frontend
    if (origin.startsWith('https') && siteUrl.startsWith('http:')) {
      siteUrl = siteUrl.replace('http:', 'https:');
    }

    console.log('Environment variables:', { fitbitClientId: Boolean(fitbitClientId), siteUrl });

    if (!fitbitClientId) {
      console.error('Missing required environment variable: FITBIT_CLIENT_ID');
      return createResponse(
        500,
        { error: 'Server configuration error' },
        origin
      );
    }

    try {
      // Get the user ID from the request
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createResponse(401, { error: 'Unauthorized' }, origin);
      }
      
      const token = authHeader.split(' ')[1];
      const userResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || ''
        }
      });
      
      if (!userResponse.ok) {
        console.error('Failed to get user:', await userResponse.text());
        return createResponse(401, { error: 'Invalid token' }, origin);
      }
      
      const user = await userResponse.json();
      if (!user?.id) {
        console.error('No user ID in response:', user);
        return createResponse(401, { error: 'User not found' }, origin);
      }
      
      // PKCE Challenge
      const codeVerifier = generateCodeVerifier(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Create state with user ID, origin, and random string for CSRF protection
      const state = JSON.stringify({
        userId: user.id,
        nonce: crypto.randomUUID(),
        origin: origin,
        codeVerifier: codeVerifier,
      });
      
      // Create the Fitbit authorization URL
      const redirectUri = `https://jrwyptpespjvjisrwnbh.supabase.co/functions/v1/fitbit-handler`;
      console.log('Using redirect URI:', redirectUri);
      
      const params = new URLSearchParams({
        client_id: fitbitClientId,
        response_type: 'code',
        scope: 'activity heartrate location nutrition profile settings sleep social weight',
        redirect_uri: redirectUri,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });
      
      console.log('Full authorization URL params:', params.toString());

      const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
      console.log('Generated auth URL:', authUrl);
      
      // Return the URL to the client
      return createResponse(200, { url: authUrl }, origin);
      
    } catch (error) {
      console.error('Error in fitbit-auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createResponse(500, { error: errorMessage }, origin);
    }
    
  } catch (error) {
    console.error('Error in Fitbit auth handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createResponse(500, { error: 'Internal server error', details: errorMessage }, origin);
  }
});
