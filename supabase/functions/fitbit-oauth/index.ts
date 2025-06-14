
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  console.log('Fitbit OAuth request:', req.method, req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    
    // Handle the authorization request
    if (req.method === 'GET' && !url.searchParams.get('code')) {
      return handleAuthRequest(req)
    }
    
    // Handle the callback with authorization code
    if (req.method === 'GET' && url.searchParams.get('code')) {
      return handleCallback(req)
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in Fitbit OAuth:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleAuthRequest(req: Request) {
  const fitbitClientId = '23QJQ3'
  const siteUrl = Deno.env.get('SITE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co'
  
  console.log('Environment check:', {
    hasClientId: !!fitbitClientId,
    siteUrl
  })

  if (!fitbitClientId) {
    return new Response(
      JSON.stringify({ error: 'Fitbit client ID not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate state for security
  const state = crypto.randomUUID()
  
  // Build authorization URL
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: fitbitClientId,
    redirect_uri: `${siteUrl}/functions/v1/fitbit-oauth`,
    scope: 'activity heartrate location nutrition profile settings sleep social weight',
    state: state,
    expires_in: '604800' // 7 days
  })

  const authUrl = `https://www.fitbit.com/oauth2/authorize?${authParams.toString()}`
  
  console.log('Generated auth URL:', authUrl)
  
  return new Response(
    JSON.stringify({ url: authUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCallback(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  console.log('Callback received:', { code: !!code, state, error })

  const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'

  if (error) {
    console.error('OAuth error:', error)
    return Response.redirect(`${siteUrl}/profile?error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    console.error('Missing code or state')
    return Response.redirect(`${siteUrl}/profile?error=missing_parameters`)
  }

  try {
    // Exchange code for tokens
    const fitbitClientId = '23QJQ3'
    const fitbitClientSecret = 'ff2f252180742b4c336459edc3f3d6c0'
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co'

    if (!fitbitClientId || !fitbitClientSecret) {
      throw new Error('Missing Fitbit credentials')
    }

    const tokenParams = new URLSearchParams({
      client_id: fitbitClientId,
      grant_type: 'authorization_code',
      redirect_uri: `${supabaseUrl}/functions/v1/fitbit-oauth`,
      code: code
    })

    console.log('Exchanging code for tokens...')
    
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`
      },
      body: tokenParams
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokens = await tokenResponse.json()
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    })

    // Get user info from auth header if available
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader }
        }
      })

      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Store tokens in database
        const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))
        
        const { error: insertError } = await supabase
          .from('fitbit_tokens')
          .upsert({
            user_id: user.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt.toISOString(),
            scope: tokens.scope
          })

        if (insertError) {
          console.error('Error storing tokens:', insertError)
        } else {
          console.log('Tokens stored successfully')
        }
      }
    }

    // Redirect with success
    return Response.redirect(`${siteUrl}/profile?fitbit_connected=true`)

  } catch (error) {
    console.error('Error in callback:', error)
    return Response.redirect(`${siteUrl}/profile?error=${encodeURIComponent(error.message)}`)
  }
}
