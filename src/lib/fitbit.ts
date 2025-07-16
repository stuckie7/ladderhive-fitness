import { supabase } from './supabase';
import type { FitbitHealthData } from '../types/fitbit-api';



// Types for API responses
interface ConnectFitbitResponse {
  authUrl: string;
}

interface FitbitApiResponse {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRate: number | null;
  sleepDuration: number | null;
  workouts: number;
}

export interface FitbitToken {
  id: string;
  user_id: string;
  fitbit_user_id: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string | null;
  created_at: string;
  updated_at: string;
}

export async function connectFitbit(): Promise<ConnectFitbitResponse> {
  const { data, error } = await supabase.functions.invoke<ConnectFitbitResponse>('fitbit-auth');
  
  if (error) {
    console.error('Error from Supabase function:', error);
    throw new Error(error.message || 'Failed to connect to Fitbit');
  }
  
  if (!data) {
    throw new Error('No data returned from connect function');
  }
  
  return data;
}

export async function disconnectFitbit(): Promise<void> {
  const { error } = await supabase
    .from('fitbit_tokens')
    .delete()
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    
  if (error) {
    throw new Error(error.message);
  }
}

export async function getFitbitConnection(): Promise<FitbitToken | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('fitbit_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }
  
  return data as FitbitToken | null;
}

export async function fetchFitbitData(): Promise<FitbitHealthData> {
  const { data, error } = await supabase.functions.invoke<FitbitApiResponse>('fitbit-fetch-data');
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('No data returned from fetch function');
  }
  
  // Transform the API response to match FitbitHealthData
  const healthData: FitbitHealthData = {
    ...data,
    lastSynced: new Date().toISOString(),
    goal: 10000, // Default step goal
    progress: data.steps ? Math.min(Math.round((data.steps / 10000) * 100), 100) : 0
  };
  
  return healthData;
}
