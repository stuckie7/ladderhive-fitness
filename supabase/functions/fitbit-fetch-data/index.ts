import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helper function to create CORS headers
const createCorsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
});

// Helper function to create a response
const createResponse = (status: number, body: any, origin: string) => {
  const headers = {
    ...createCorsHeaders(origin),
    'Content-Type': 'application/json',
  };
  
  return new Response(
    JSON.stringify(body),
    { status, headers }
  );
};

// Interface for the response data
interface FitbitApiResponse {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRate: number | null;
  sleepDuration: number | null;
  workouts: number;
}

serve(async (req) => {
  // Get the origin from the request headers
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = createCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 204,
      headers: {
        ...corsHeaders,
        'Content-Length': '0',
      } 
    });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'POST') {
      return createResponse(
        405,
        { error: 'Method not allowed' },
        origin
      );
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return createResponse(
        500,
        { error: 'Server configuration error' },
        origin
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createResponse(
        401,
        { error: 'Unauthorized' },
        origin
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return createResponse(
        401,
        { error: 'Unauthorized' },
        origin
      );
    }

    // Get the user's Fitbit tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'fitbit')
      .single();

    if (tokensError || !tokens) {
      return createResponse(
        400,
        { error: 'Fitbit not connected' },
        origin
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at) : null;
    
    if (expiresAt && now >= expiresAt) {
      // Token is expired, refresh it
      const refreshResponse = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('FITBIT_CLIENT_ID')}:${Deno.env.get('FITBIT_CLIENT_SECRET')}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token
        })
      });

      if (!refreshResponse.ok) {
        return createResponse(
          400,
          { error: 'Failed to refresh token' },
          origin
        );
      }

      const tokenData = await refreshResponse.json();
      
      // Update the tokens in the database
      await supabase
        .from('user_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || tokens.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', tokens.id);
      
      tokens.access_token = tokenData.access_token;
    }

    // Fetch data from Fitbit API
    const today = new Date().toISOString().split('T')[0];
    const [activityResponse, heartRateResponse, sleepResponse] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d/1min.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      })
    ]);

    if (!activityResponse.ok || !heartRateResponse.ok || !sleepResponse.ok) {
      return createResponse(
        500,
        { error: 'Failed to fetch data from Fitbit' },
        origin
      );
    }

    const [activityData, heartRateData, sleepData] = await Promise.all([
      activityResponse.json(),
      heartRateResponse.json(),
      sleepResponse.json()
    ]);

    // Process the data
    const responseData: FitbitApiResponse = {
      steps: activityData.summary?.steps || 0,
      calories: activityData.summary?.caloriesOut || 0,
      distance: activityData.summary?.distances?.find((d: any) => d.activity === 'total')?.distance || 0,
      activeMinutes: activityData.summary?.fairlyActiveMinutes + activityData.summary?.veryActiveMinutes || 0,
      heartRate: heartRateData['activities-heart']?.[0]?.value?.restingHeartRate || null,
      sleepDuration: sleepData.sleep?.[0]?.minutesAsleep || null,
      workouts: activityData.summary?.activityCalories > 0 ? 1 : 0
    };

    return createResponse(200, responseData, origin);
    
  } catch (error) {
    console.error('Error in fitbit-fetch-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createResponse(500, { error: 'Internal server error', details: errorMessage }, origin);
  }
});
