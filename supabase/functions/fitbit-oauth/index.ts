
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req: Request) => {
  console.log('Fitbit OAuth request:', req.method, req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Get environment variables and secrets
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')
    const siteUrl = Deno.env.get('SITE_URL')
    
    console.log('Environment check:', {
      hasClientId: !!fitbitClientId,
      hasSiteUrl: !!siteUrl,
      supabaseUrl
    })

    if (!fitbitClientId) {
      return new Response(
        JSON.stringify({ error: 'Fitbit client ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!siteUrl) {
      return new Response(
        JSON.stringify({ error: 'Site URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Origin for CORS and later redirect
    const originHeader = req.headers.get('origin') || '*';

    // Generate PKCE values
    const generateCodeVerifier = (length: number): string => {
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let text = '';
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    const generateCodeChallenge = async (verifier: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    // Create verifier/challenge
    const codeVerifier = generateCodeVerifier(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Nonce to link verifier
    const nonce = crypto.randomUUID();

    // Persist verifier in fitbit_pkce (service role bypasses RLS)
    const { error: pkceErr } = await supabase.from('fitbit_pkce').insert({
      pkce_key: nonce,
      user_id: user.id,
      code_verifier: codeVerifier,
    });
    if (pkceErr) {
      console.error('Failed to store PKCE verifier:', pkceErr);
      return new Response(
        JSON.stringify({ error: 'Server PKCE storage failure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build state without exposing verifier
    const state = JSON.stringify({ userId: user.id, nonce, origin: originHeader });

    // Build authorization URL with PKCE params
    const redirectUri = `${supabaseUrl}/functions/v1/fitbit-handler`;
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: fitbitClientId,
      redirect_uri: redirectUri,
      scope: 'activity heartrate location nutrition profile settings sleep social weight',
      state,
      expires_in: '604800',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://www.fitbit.com/oauth2/authorize?${authParams.toString()}`
    
    console.log('Generated auth URL:', authUrl)
    console.log('Redirect URI:', redirectUri)
    console.log('State with user ID:', state)
    
    return new Response(
      JSON.stringify({ url: authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    const error = e as Error;
    console.error('Error in Fitbit OAuth:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
