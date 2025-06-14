
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Util: generate a random URL-safe base64 string for PKCE (43-128 chars)
function randomCodeVerifier(length = 64) {
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Util: base64url encode buffer
function base64urlencode(buffer: ArrayBuffer) {
  let str = '';
  const bytes = new Uint8Array(buffer);
  for (const char of bytes) str += String.fromCharCode(char);
  return btoa(str)
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Util: hash the code_verifier
async function pkceChallengeFromVerifier(verifier: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return base64urlencode(digest);
}

function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co';
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Prefer service role key for backend writes
  const supabaseKey = supabaseService || supabaseAnon;
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get('authorization') ?? '' } },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    if (req.method === 'GET' && !url.searchParams.get('code')) {
      return await handleAuthRequest(req);
    }

    if (req.method === 'GET' && url.searchParams.get('code')) {
      return await handleCallback(req);
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Fitbit OAuth:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleAuthRequest(req: Request) {
  const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
  const siteUrl = Deno.env.get('SITE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co';
  const supabase = getSupabaseClient(req);

  // Authenticate and get user ID if possible
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (!user || userErr) {
    return new Response(
      JSON.stringify({ error: 'Authenticated user required for Fitbit connection.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!fitbitClientId) {
    return new Response(
      JSON.stringify({ error: 'Fitbit client ID not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Generate secure state and PKCE verifier/challenge
  const state = crypto.randomUUID();
  const code_verifier = randomCodeVerifier(64);
  const code_challenge = await pkceChallengeFromVerifier(code_verifier);

  // Store state + PKCE in auth_states for short period (10 mins)
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('fitbit_auth_states')
    .insert([
      {
        user_id: user.id,
        state,
        code_verifier,
        expires_at,
      }
    ]);
  if (error) {
    console.error('Insert fitbit_auth_states error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to store OAuth state' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Build auth URL with PKCE params
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: fitbitClientId,
    redirect_uri: `${siteUrl}/functions/v1/fitbit-oauth`,
    scope: 'activity heartrate location nutrition profile settings sleep social weight',
    state,
    expires_in: '604800',
    code_challenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `https://www.fitbit.com/oauth2/authorize?${authParams.toString()}`;
  console.log('Generated auth URL:', authUrl);

  return new Response(
    JSON.stringify({ url: authUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCallback(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const supabase = getSupabaseClient(req);

  console.log('OAuth callback received:', { code: !!code, state, error });

  if (error) {
    console.error('OAuth error:', error);
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    console.error('Missing code or state');
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=missing_parameters`);
  }

  // Look up code_verifier by state
  const { data: authState, error: fetchErr } = await supabase
    .from('fitbit_auth_states')
    .select('*')
    .eq('state', state)
    .maybeSingle();

  if (fetchErr || !authState) {
    console.error('No valid code_verifier found for state:', fetchErr);
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=invalid_state`);
  }
  const code_verifier: string = authState.code_verifier;

  try {
    // Exchange code for tokens with PKCE
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET');
    const siteUrl = Deno.env.get('SITE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co';
    if (!fitbitClientId || !fitbitClientSecret) {
      throw new Error('Missing Fitbit credentials');
    }

    const tokenParams = new URLSearchParams({
      client_id: fitbitClientId,
      grant_type: 'authorization_code',
      redirect_uri: `${siteUrl}/functions/v1/fitbit-oauth`,
      code,
      code_verifier
    });

    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`
      },
      body: tokenParams
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    // TODO: Save tokens for user (currently omitted)

    // Clean up: delete the used auth state
    await supabase
      .from('fitbit_auth_states')
      .delete()
      .eq('state', state);

    return Response.redirect(`${siteUrl}/profile?fitbit_connected=true`);

  } catch (err) {
    console.error('Error in callback:', err);
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=${encodeURIComponent(err.message)}`);
  }
}
