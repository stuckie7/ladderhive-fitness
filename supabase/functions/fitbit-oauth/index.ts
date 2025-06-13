// Fitbit OAuth 2.0 Connect Endpoint with Debug Logging
console.log('Initializing Fitbit OAuth function...');

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Log environment variables (without sensitive values)
console.log('Environment variables:', {
  HAS_SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
  HAS_FITBIT_CLIENT_ID: !!Deno.env.get('FITBIT_CLIENT_ID'),
  HAS_SITE_URL: !!Deno.env.get('SITE_URL')
});

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID') || '';
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

    if (!fitbitClientId) {
      throw new Error('Missing required environment variables');
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization') || '';
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { 
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    console.error('Error in Fitbit connect handler:', error);
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
