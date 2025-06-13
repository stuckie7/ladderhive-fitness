// Simple Fitbit OAuth 2.0 Connect Endpoint
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

    if (!fitbitClientId) {
      throw new Error('Missing required environment variables');
    }

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
    
    // Return the URL to the client
    return new Response(
      JSON.stringify({ url: authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in Fitbit auth handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
