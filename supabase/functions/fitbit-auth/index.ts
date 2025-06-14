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

serve(async (req) => {
  // Get the origin from the request headers
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = createCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 204,
      headers: {
        ...corsHeaders,
        'Content-Length': '0',
      } 
    });
  }

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
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

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
      // Generate a random state parameter for CSRF protection
      const state = crypto.randomUUID();
      
      // Create the Fitbit authorization URL
      const params = new URLSearchParams({
        client_id: fitbitClientId,
        response_type: 'code',
        scope: 'activity heartrate location nutrition profile settings sleep social weight',
        redirect_uri: `${siteUrl}/api/auth/callback`,
        state: state,
        code_challenge: 'challenge', // You should implement PKCE for better security
        code_challenge_method: 'plain'
      });

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
