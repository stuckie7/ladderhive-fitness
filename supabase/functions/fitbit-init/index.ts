import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-production-domain.com'  // Replace with your production domain
];

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin'
});

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const headers = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 204,
      headers: {
        ...headers,
        'Content-Length': '0'
      }
    });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { 
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true' 
          } 
        }
      );
    }

    // Get environment variables
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

    if (!fitbitClientId) {
      throw new Error('Missing required environment variables');
    }

    // Create the Fitbit authorization URL
    const params = new URLSearchParams({
      client_id: fitbitClientId,
      response_type: 'code',
      scope: 'activity heartrate location nutrition profile settings sleep social weight',
      redirect_uri: `${siteUrl}/api/auth/callback`,
      state: crypto.randomUUID(),
    });

    const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
    
    // Return the URL to the client
    return new Response(
      JSON.stringify({ url: authUrl }),
      { 
        headers: { 
          ...corsHeaders(origin),
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in fitbit-init:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to initialize Fitbit connection' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders(origin),
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
