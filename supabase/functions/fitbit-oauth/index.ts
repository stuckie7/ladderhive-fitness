
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
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
  const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')
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

  if (error) {
    console.error('OAuth error:', error)
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    console.error('Missing code or state')
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=missing_parameters`)
  }

  try {
    // Exchange code for tokens
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET')
    const siteUrl = Deno.env.get('SITE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co'

    if (!fitbitClientId || !fitbitClientSecret) {
      throw new Error('Missing Fitbit credentials')
    }

    const tokenParams = new URLSearchParams({
      client_id: fitbitClientId,
      grant_type: 'authorization_code',
      redirect_uri: `${siteUrl}/functions/v1/fitbit-oauth`,
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

    // Store tokens in database (we'll implement this next)
    // For now, just redirect with success
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?fitbit_connected=true`)

  } catch (error) {
    console.error('Error in callback:', error)
    return Response.redirect(`${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/profile?error=${encodeURIComponent(error.message)}`)
  }
}
