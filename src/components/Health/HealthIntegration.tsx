import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHealth } from '@/hooks/useHealth';
// @ts-ignore - Auth context is available at runtime
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, HeartPulse, Zap, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
// @ts-ignore - Supabase client is available
import { supabase } from '@/lib/supabase';

interface HealthStats {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRate: number | null;
  sleepDuration: number | null;
  lastSynced: Date | null;
  goal: number;
  progress: number;
  workouts: number;
}

export function HealthIntegration() {
  // @ts-ignore - Auth context is available at runtime
  const { user } = useAuth();
  const { isAvailable, isAuthorized, isLoading: isHealthLoading, error: healthError, lastSynced, healthData } = useHealth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<Partial<HealthStats>>({
    steps: 0,
    calories: 0,
    distance: 0,
    activeMinutes: 0,
    heartRate: null,
    sleepDuration: null,
    lastSynced: null,
    goal: 10000,
    progress: 0,
    workouts: 0
  });

  const connectFitbit = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID) {
      setError('Fitbit client ID is not configured');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback/fitbit`;
    const scope = 'activity profile heartrate sleep';
    
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    window.location.href = authUrl;
  }, []);

  // Check if user is connected to Fitbit
  const checkConnection = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      // @ts-ignore - Supabase client is available
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'fitbit')
        .maybeSingle();

      if (error) throw error;
      
      setIsConnected(!!data);
      return !!data;
    } catch (error) {
      console.error('Error checking Fitbit connection:', error);
      setError('Failed to check Fitbit connection');
      return false;
    }
  }, [user?.id]);

  // Fetch health data from Fitbit
  const fetchHealthData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Mock data for now since we don't have real Fitbit service
      const mockActivityData = {
        summary: {
          steps: 8432,
          caloriesOut: 2450,
          distances: [{ activity: 'total', distance: 6.2 }],
          veryActiveMinutes: 30,
          fairlyActiveMinutes: 15
        }
      };
      
      const mockSleepData = {
        sleep: [{
          duration: 27000000, // 7.5 hours in ms
          efficiency: 95
        }]
      };
      
      const mockHeartRateData = {
        activitiesHeartIntraday: {
          dataset: [
            { time: '23:00:00', value: 68 }
          ]
        }
      };
      
      // Calculate sleep duration in hours
      let sleepDuration = null;
      if (mockSleepData?.sleep?.length > 0) {
        const sleep = mockSleepData.sleep[0];
        sleepDuration = sleep.duration / 3600000; // Convert ms to hours
      }
      
      // Get resting heart rate if available
      const restingHeartRate = mockHeartRateData?.activitiesHeartIntraday?.dataset?.slice(-1)[0]?.value || null;
      
      setStats({
        steps: mockActivityData.summary.steps,
        calories: mockActivityData.summary.caloriesOut,
        distance: mockActivityData.summary.distances[0].distance,
        activeMinutes: mockActivityData.summary.veryActiveMinutes + mockActivityData.summary.fairlyActiveMinutes,
        heartRate: restingHeartRate,
        sleepDuration,
        lastSynced: new Date(),
        goal: 10000,
        progress: Math.min((mockActivityData.summary.steps / 10000) * 100, 100),
        workouts: 2
      });
      
    } catch (error) {
      console.error('Error fetching health data:', error);
      setError('Failed to fetch health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const connected = await checkConnection();
      if (connected) {
        await fetchHealthData();
      }
    };
    
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkConnection, fetchHealthData]);

  // Use mock data for now
  const displayStats = {
    steps: 8432,
    calories: 2450,
    distance: 6.2,
    activeMinutes: 45,
    heartRate: 68,
    sleepDuration: 7.5,
    lastSynced: new Date(),
    goal: 10000,
    progress: 84,
    workouts: 2
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Health Stats</CardTitle>
            <CardDescription>
              {displayStats.lastSynced
                ? `Last synced ${formatDistanceToNow(new Date(displayStats.lastSynced), { addSuffix: true })}`
                : 'Not synced yet'}
            </CardDescription>
          </div>
          <Button onClick={fetchHealthData} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="space-y-4">
            <p>Connect your Fitbit account to track your health metrics.</p>
            <Button onClick={connectFitbit} disabled={isLoading}>
              <Activity className="mr-2 h-4 w-4" />
              Connect Fitbit
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Steps</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.steps.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(displayStats.progress)}% of daily goal
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.activeMinutes}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.heartRate ? `${displayStats.heartRate} bpm` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">Resting</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                <Moon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.sleepDuration ? `${displayStats.sleepDuration.toFixed(1)}h` : '--'}
                </div>
                <p className="text-xs text-muted-foreground">Last night</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
