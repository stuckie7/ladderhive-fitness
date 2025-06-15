
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

    // Get site URL from environment
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'

    if (error) {
      console.error('OAuth error:', error)
      return Response.redirect(`${siteUrl}/profile?error=${encodeURIComponent(error)}`)
    }

    if (!code || !state) {
      console.error('Missing authorization code or state')
      return Response.redirect(`${siteUrl}/profile?error=missing_parameters`)
    }

    // Parse state to get user ID
    let userId: string
    try {
      const stateData = JSON.parse(state)
      userId = stateData.userId
      if (!userId) {
        throw new Error('No user ID in state')
      }
      console.log('Extracted user ID from state:', userId)
    } catch (parseError) {
      console.error('Error parsing state:', parseError)
      return Response.redirect(`${siteUrl}/profile?error=invalid_state`)
    }

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get Fitbit credentials from environment
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET')

    if (!fitbitClientId || !fitbitClientSecret) {
      console.error('Missing Fitbit credentials')
      return Response.redirect(`${siteUrl}/profile?error=missing_credentials`)
    }

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
    console.log('Tokens received successfully', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    })

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()

    // Store tokens in database using upsert to handle existing records
    const { error: dbError } = await supabase
      .from('fitbit_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        scope: tokens.scope || 'activity heartrate location nutrition profile settings sleep social weight',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Database error storing tokens:', dbError)
      return Response.redirect(`${siteUrl}/profile?error=database_error`)
    }

    console.log('Tokens stored successfully in database for user:', userId)

    // Redirect to success page
    return Response.redirect(`${siteUrl}/profile?fitbit_connected=true`)

  } catch (error) {
    console.error('Error in Fitbit callback:', error)
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'
    return Response.redirect(`${siteUrl}/profile?error=${encodeURIComponent(error.message)}`)
  }
})
