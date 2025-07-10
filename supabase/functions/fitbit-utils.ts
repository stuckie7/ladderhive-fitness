
interface FitbitTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
}

// Get environment variables
function getEnvVars() {
  return {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL') || '',
    SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') || '',
    FITBIT_CLIENT_ID: Deno.env.get('FITBIT_CLIENT_ID') || '',
    FITBIT_CLIENT_SECRET: Deno.env.get('FITBIT_CLIENT_SECRET') || '',
    SITE_URL: Deno.env.get('SITE_URL') || 'http://localhost:3000',
  };
}

// Create Supabase client
function createClient(url: string, key: string, options?: any) {
  // This is a mock implementation since we're not importing the actual client
  return {
    from: (table: string) => ({
      select: (fields?: string) => ({
        eq: (field: string, value: any) => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      update: (data: any) => ({
        eq: (field: string, value: any) => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        })
      })
    })
  };
}

/**
 * Fetches the user's Fitbit access token from the database
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Access token or null if not found
 */
export async function getFitbitAccessToken(supabase: any, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('fitbit_tokens')
    .select('access_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching Fitbit token:', error);
    return null;
  }

  // Check if token is expired
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data.access_token;
}

/**
 * Fetches health data from Fitbit API
 * @param accessToken Fitbit access token
 * @param endpoint Fitbit API endpoint (e.g., 'activities/date/today.json')
 * @returns Response data or null if request fails
 */
export async function fetchFitbitData(accessToken: string, endpoint: string): Promise<any> {
  try {
    const response = await fetch(`https://api.fitbit.com/1/user/-/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fitbit API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);
    throw error;
  }
}

/**
 * Refreshes the Fitbit access token using the refresh token
 * @param userId User ID
 * @returns New token data or null if refresh fails
 */
export async function refreshFitbitToken(userId: string): Promise<FitbitTokenData | null> {
  const env = getEnvVars();
  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get the current refresh token
  const { data: tokenData, error: tokenError } = await supabase
    .from('fitbit_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single();

  if (tokenError || !tokenData) {
    console.error('No refresh token found for user:', userId);
    return null;
  }

  // Exchange refresh token for new access token
  const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token
    })
  });

  if (!tokenResponse.ok) {
    console.error('Failed to refresh token:', await tokenResponse.text());
    return null;
  }

  const newTokenData = await tokenResponse.json();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (newTokenData.expires_in * 1000));

  // Update the tokens in the database
  const { data: updatedToken, error: updateError } = await supabase
    .from('fitbit_tokens')
    .update({
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token || tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating tokens:', updateError);
    return null;
  }

  return updatedToken;
}

/**
 * Fetches the user's daily activity summary
 * @param accessToken Fitbit access token
 * @param date Date in yyyy-MM-dd format (default: today)
 */
export async function fetchDailyActivity(accessToken: string, date: string = 'today'): Promise<any> {
  return fetchFitbitData(accessToken, `activities/date/${date}.json`);
}

/**
 * Fetches the user's sleep data
 * @param accessToken Fitbit access token
 * @param date Date in yyyy-MM-dd format (default: today)
 */
export async function fetchSleepData(accessToken: string, date: string = 'today'): Promise<any> {
  return fetchFitbitData(accessToken, `sleep/date/${date}.json`);
}

/**
 * Fetches the user's heart rate data
 * @param accessToken Fitbit access token
 * @param date Date in yyyy-MM-dd format (default: today)
 */
export async function fetchHeartRateData(accessToken: string, date: string = 'today'): Promise<any> {
  return fetchFitbitData(accessToken, `activities/heart/date/${date}/1d/1sec.json`);
}

/**
 * Fetches the user's weight data
 * @param accessToken Fitbit access token
 * @param date Date in yyyy-MM-dd format (default: today)
 */
export async function fetchWeightData(accessToken: string, date: string = 'today'): Promise<any> {
  return fetchFitbitData(accessToken, `body/weight/date/${date}.json`);
}
