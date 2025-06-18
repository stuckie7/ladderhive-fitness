import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FitbitApiResponse {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRate: number | null;
  sleepDuration: number | null;
  workouts: number;
}

serve(async (req: Request) => {
  console.log('Function execution started. Version: 3'); // Diagnostic log
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: tokens, error: tokensError } = await supabase
      .from('fitbit_tokens') // Corrected table name
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokensError || !tokens) {
      return new Response(JSON.stringify({ error: 'Fitbit not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at * 1000) : null; // expires_at is a UNIX timestamp
    if (expiresAt && now >= expiresAt) {
      const refreshResponse = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${Deno.env.get('FITBIT_CLIENT_ID')}:${Deno.env.get('FITBIT_CLIENT_SECRET')}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
        }),
      });

      if (!refreshResponse.ok) {
        const errorBody = await refreshResponse.text();
        console.error('Failed to refresh token:', errorBody);
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenData = await refreshResponse.json();
      const newExpiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;

      await supabase
        .from('fitbit_tokens') // Corrected table name
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || tokens.refresh_token,
          expires_at: newExpiresAt,
        })
        .eq('user_id', user.id);

      tokens.access_token = tokenData.access_token;
    }

    const today = new Date().toISOString().split('T')[0];
    const [activityResponse, heartRateResponse, sleepResponse] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` },
      }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d/1min.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` },
      }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` },
      }),
    ]);

    if (!activityResponse.ok || !heartRateResponse.ok || !sleepResponse.ok) {
        const errorDetails = {
            activity: activityResponse.statusText,
            heart: heartRateResponse.statusText,
            sleep: sleepResponse.statusText,
        };
      return new Response(JSON.stringify({ error: 'Failed to fetch data from Fitbit', details: errorDetails }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [activityData, heartRateData, sleepData] = await Promise.all([
      activityResponse.json(),
      heartRateResponse.json(),
      sleepResponse.json(),
    ]);

    const responseData: FitbitApiResponse = {
      steps: activityData.summary?.steps || 0,
      calories: activityData.summary?.caloriesOut || 0,
      distance: activityData.summary?.distances?.find((d: any) => d.activity === 'total')?.distance || 0,
      activeMinutes: (activityData.summary?.fairlyActiveMinutes || 0) + (activityData.summary?.veryActiveMinutes || 0),
      heartRate: heartRateData['activities-heart']?.[0]?.value?.restingHeartRate || null,
      sleepDuration: (sleepData.summary?.totalMinutesAsleep || 0) / 60, // Convert minutes to hours
      workouts: activityData.summary?.activityCalories > 0 ? 1 : 0, // Simplified logic
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fitbit-fetch-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
