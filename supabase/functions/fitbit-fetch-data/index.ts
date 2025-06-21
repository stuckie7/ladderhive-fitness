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

// Helper function to refresh Fitbit token and update the database
async function refreshFitbitToken(refreshToken: string, tokenId: string) {
  console.log(`Starting token refresh for token ID: ${tokenId}`);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
  const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET');

  if (!supabaseUrl || !serviceRoleKey || !fitbitClientId || !fitbitClientSecret) {
    throw new Error('Server configuration error: Missing credentials for token refresh.');
  }

  // Use a dedicated admin client to ensure permissions
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const refreshResponse = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });
  
  const responseBodyText = await refreshResponse.text();
  console.log(`Fitbit token refresh API response status: ${refreshResponse.status}`);
  console.log(`Fitbit token refresh API response body: ${responseBodyText}`);

  if (!refreshResponse.ok) {
    throw new Error(`Failed to refresh token from Fitbit API: ${responseBodyText}`);
  }

  const refreshedTokensData = JSON.parse(responseBodyText);

  const newExpiresAt = new Date(Date.now() + refreshedTokensData.expires_in * 1000).toISOString();
  
  const { error: updateError } = await supabaseAdmin
    .from('fitbit_tokens')
    .update({
      access_token: refreshedTokensData.access_token,
      refresh_token: refreshedTokensData.refresh_token || refreshToken,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tokenId);

  if (updateError) {
    console.error('Database error while updating token:', JSON.stringify(updateError));
    throw new Error(`Failed to save refreshed token to database: ${updateError.message}`);
  }
  
  console.log(`Successfully updated token ${tokenId} in the database.`);
  return refreshedTokensData.access_token;
}

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
  console.log(`fitbit-fetch-data invoked. Method: ${req.method}, Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
  // Get the origin from the request headers
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = createCorsHeaders(origin);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return createResponse(405, { error: 'Method Not Allowed' }, origin);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return createResponse(500, { error: 'Server configuration error: Missing Supabase credentials.' }, origin);
    }

    // Create a Supabase client with the user's authentication context
    const supabase = createClient(
      supabaseUrl,
      anonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError?.message || 'No user found.');
      return createResponse(401, { error: 'Unauthorized' }, origin);
    }

    console.log('User authenticated:', user.id);

    // Create a separate admin client to perform privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    console.log('PASSED AUTH CHECK BLOCK. User object should be valid.');

    // Get the user's Fitbit tokens
    const { data: tokens, error: tokensError } = await supabaseAdmin
      .from('fitbit_tokens') // Changed table name
      .select('*')
      .eq('user_id', user.id)
      // .eq('provider', 'fitbit') // Removed provider filter
      .single();

    if (tokensError) {
      console.error('Error fetching tokens from fitbit_tokens:', JSON.stringify(tokensError));
    }
    if (!tokens) {
      console.log('No tokens found in fitbit_tokens for user:', user.id);
    }
    if (tokens) {
      console.log('Tokens fetched from fitbit_tokens:', JSON.stringify(tokens));
    }

    if (tokensError || !tokens) {
      console.log('No Fitbit connection found for user:', user.id);
      return createResponse(
        200, 
        { 
          connected: false, 
          error: 'Fitbit not connected',
          steps: 0,
          calories: 0,
          distance: 0,
          activeMinutes: 0,
          heartRate: null,
          sleepDuration: null,
          workouts: 0
        },
        origin
      );
    }

    // Check if token is expired and refresh if needed
    const now = new Date();
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at) : null;
    console.log('Token expiresAt:', expiresAt ? expiresAt.toISOString() : 'null', 'Current time:', now.toISOString());

    if (expiresAt && now >= expiresAt) {
      try {
        console.log('Fitbit token expired, attempting refresh via helper function...');
        const newAccessToken = await refreshFitbitToken(tokens.refresh_token, tokens.id);
        tokens.access_token = newAccessToken;
        console.log('Fitbit token successfully refreshed and updated in local context.');
      } catch (refreshError) {
        console.error('Token refresh process failed:', refreshError.message);
        return createResponse(
          500, 
          { error: 'Failed to refresh Fitbit token.', details: refreshError.message }, 
          origin
        );
      }
    }

    // Fetch data from Fitbit API
    const body = await req.json();
    const date = body.date;
    console.log('Received request body:', JSON.stringify(body));

    const dateToFetch = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().split('T')[0];
    
    console.log(`Date being used for Fitbit API call: ${dateToFetch}`);

    console.log(`Fetching Fitbit data for date: ${dateToFetch} using token starting with: ${tokens.access_token.substring(0, 10)}...`);

    const [activityResponse, heartRateResponse, sleepResponse] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${dateToFetch}.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${dateToFetch}/1d/1min.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${dateToFetch}.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      })
    ]);

    console.log(`Fitbit API - Activity Status: ${activityResponse.status}`);
    console.log(`Fitbit API - Heart Rate Status: ${heartRateResponse.status}`);
    console.log(`Fitbit API - Sleep Status: ${sleepResponse.status}`);

    if (!activityResponse.ok || !heartRateResponse.ok || !sleepResponse.ok) {
      if (!activityResponse.ok) {
        const errorBody = await activityResponse.text();
        console.error(`Fitbit API - Activity Error: ${activityResponse.status}, Body: ${errorBody}`);
      }
      if (!heartRateResponse.ok) {
        const errorBody = await heartRateResponse.text();
        console.error(`Fitbit API - Heart Rate Error: ${heartRateResponse.status}, Body: ${errorBody}`);
      }
      if (!sleepResponse.ok) {
        const errorBody = await sleepResponse.text();
        console.error(`Fitbit API - Sleep Error: ${sleepResponse.status}, Body: ${errorBody}`);
      }

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

    console.log('Raw Fitbit Activity Data:', JSON.stringify(activityData, null, 2));
    console.log('Raw Fitbit Heart Rate Data:', JSON.stringify(heartRateData, null, 2));
    console.log('Raw Fitbit Sleep Data:', JSON.stringify(sleepData, null, 2));

    const responsePayload = {
      message: 'Successfully fetched Fitbit data',
      stats: {
        steps: activityData.summary?.steps || 0,
        calories: activityData.summary?.caloriesOut || 0,
        distance: activityData.summary?.distances?.find((d: any) => d.activity === 'total')?.distance || 0,
        activeMinutes: (activityData.summary?.lightlyActiveMinutes || 0) + (activityData.summary?.fairlyActiveMinutes || 0) + (activityData.summary?.veryActiveMinutes || 0),
        heartRate: heartRateData['activities-heart']?.[0]?.value?.restingHeartRate || null,
        sleepDuration: sleepData.summary?.totalMinutesAsleep || 0,
        lastSynced: new Date(),
        goal: activityData.goals?.steps || 0,
        progress: (activityData.summary?.steps / activityData.goals?.steps) * 100 || 0,
        workouts: activityData.activities?.length || 0,
      },
      raw: { activityData, heartRateData, sleepData },
    };

    console.log('Final payload being sent to client:', JSON.stringify(responsePayload.stats));

    return createResponse(200, responsePayload, origin);
    
  } catch (error) {
    console.error('Error in fitbit-fetch-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createResponse(500, { error: 'Internal server error', details: errorMessage }, origin);
  }
});
