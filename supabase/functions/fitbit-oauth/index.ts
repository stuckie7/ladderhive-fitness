
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    // Get environment variables
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID') || '23QJQ3'
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jrwyptpespjvjisrwnbh.supabase.co'
    
    console.log('Environment check:', {
      hasClientId: !!fitbitClientId,
      supabaseUrl
    })

    if (!fitbitClientId) {
      return new Response(
        JSON.stringify({ error: 'Fitbit client ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate state for security
    const state = crypto.randomUUID()
    
    // Build authorization URL - Use the callback function for redirect
    const redirectUri = `${supabaseUrl}/functions/v1/fitbit-callback`
    
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: fitbitClientId,
      redirect_uri: redirectUri,
      scope: 'activity heartrate location nutrition profile settings sleep social weight',
      state: state,
      expires_in: '604800' // 7 days
    })

    const authUrl = `https://www.fitbit.com/oauth2/authorize?${authParams.toString()}`
    
    console.log('Generated auth URL:', authUrl)
    console.log('Redirect URI:', redirectUri)
    
    return new Response(
      JSON.stringify({ url: authUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in Fitbit OAuth:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
