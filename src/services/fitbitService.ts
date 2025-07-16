import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface FitbitActivity {
  dateTime: string;
  value: string | number;
}

export class FitbitService {
  static async getAccessToken(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('fitbit_tokens')
      .select('access_token, expires_at, refresh_token')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error getting Fitbit access token:', error);
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (expiresAt.getTime() < now.getTime() - 300000) { // 5 minutes buffer
      return this.refreshAccessToken(userId, data.refresh_token);
    }

    return data.access_token;
  }

  private static async refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);
      params.append('client_id', import.meta.env.VITE_FITBIT_CLIENT_ID || '');

      const response = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_FITBIT_CLIENT_ID}:${import.meta.env.VITE_FITBIT_CLIENT_SECRET}`)}`,
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to refresh token');
      }

      // Update the tokens in the database
      const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      const { error } = await supabase
        .from('fitbit_tokens')
        .update({
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  static async getDailyActivity(userId: string, date: string = 'today') {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) return null;

    try {
      const response = await fetch(
        `https://api.fitbit.com/1/user/-/activities/date/${date}.json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  }

  static async getHeartRate(userId: string, date: string = 'today', period: string = '1d') {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) return null;

    try {
      const response = await fetch(
        `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/${period}.json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch heart rate data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      throw error;
    }
  }

  static async getSleepLog(userId: string, date: string = 'today') {
    const accessToken = await this.getAccessToken(userId);
    if (!accessToken) return null;

    try {
      const response = await fetch(
        `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch sleep data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      throw error;
    }
  }
}
