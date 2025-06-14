
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  console.log('Fitbit callback request:', req.method, req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    console.log('Callback parameters:', { code: !!code, state, error })

    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'

    if (error) {
      console.error('OAuth error:', error)
      return Response.redirect(`${siteUrl}/profile?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      console.error('Missing authorization code')
      return Response.redirect(`${siteUrl}/profile?error=missing_code`)
    }

    // Exchange code for tokens
    const fitbitClientId = '23QJQ3'
    const fitbitClientSecret = 'ff2f252180742b4c336459edc3f3d6c0'
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co'

    const tokenParams = new URLSearchParams({
      client_id: fitbitClientId,
      grant_type: 'authorization_code',
      redirect_uri: `${supabaseUrl}/functions/v1/fitbit-callback`,
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
      return Response.redirect(`${siteUrl}/profile?error=token_exchange_failed`)
    }

    const tokens = await tokenResponse.json()
    console.log('Tokens received successfully')

    // Store tokens in a temporary way (in real app, you'd want to associate with a user)
    // For now, redirect with success and let the frontend handle token storage
    const redirectUrl = new URL(`${siteUrl}/profile`)
    redirectUrl.searchParams.set('fitbit_connected', 'true')
    redirectUrl.searchParams.set('access_token', tokens.access_token)
    redirectUrl.searchParams.set('refresh_token', tokens.refresh_token)
    redirectUrl.searchParams.set('expires_in', tokens.expires_in.toString())

    return Response.redirect(redirectUrl.toString())

  } catch (error) {
    console.error('Error in Fitbit callback:', error)
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    return Response.redirect(`${siteUrl}/profile?error=${encodeURIComponent(error.message)}`)
  }
})
