
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, HeartPulse, Zap, Loader2, AlertCircle, RefreshCw, Moon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

const StatCard = ({ title, value, icon, goal, progress }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  goal?: number;
  progress?: number;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {goal !== undefined && progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const HealthIntegration = () => {
  const { user } = useAuth();
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
    try {
      setIsLoading(true);
      setError(null);

      // Verify authentication before attempting connection
      if (!user?.id) {
        setError('Please log in to connect your Fitbit account.');
        return;
      }

      console.log('Initiating Fitbit connection...');
      
      // Get the authorization URL from our edge function
      const { data, error } = await supabase.functions.invoke('fitbit-oauth');
      
      if (error) {
        throw new Error(error.message || 'Failed to get authorization URL');
      }
      
      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }
      
      console.log('Redirecting to Fitbit authorization:', data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error('Error connecting to Fitbit:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Fitbit');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const checkConnection = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return false;
    }
    
    try {
      console.log('Checking Fitbit connection for user:', user.id);
      
      // Use maybeSingle() to handle cases where no token exists
      const { data, error } = await supabase
        .from('fitbit_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking Fitbit connection:', error);
        // Don't show error for RLS/permission issues, just assume not connected
        if (error.code === 'PGRST301' || error.message.includes('RLS') || error.message.includes('permission')) {
          console.log('RLS/Permission issue, treating as not connected');
          setIsConnected(false);
        } else {
          setError('Failed to check Fitbit connection');
          setIsConnected(false);
        }
        return false;
      }
      
      if (!data) {
        console.log('No Fitbit token found for user');
        setIsConnected(false);
        return false;
      }
      
      const isTokenValid = new Date(data.expires_at) > new Date();
      console.log('Token valid:', isTokenValid);
      setIsConnected(isTokenValid);
      return isTokenValid;
    } catch (error) {
      console.error('Error checking Fitbit connection:', error);
      setError('Failed to check Fitbit connection');
      setIsConnected(false);
      return false;
    }
  }, [user?.id]);

  const fetchHealthData = useCallback(async () => {
    if (!user?.id || !isConnected) {
      console.log('Cannot fetch health data: user not authenticated or Fitbit not connected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, use mock data since we haven't implemented the data fetching yet
      const mockData = {
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
      
      setStats(mockData);
    } catch (error) {
      console.error('Error fetching health data:', error);
      setError('Failed to fetch health data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isConnected]);

  const disconnectFitbit = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error disconnecting Fitbit:', error);
        throw error;
      }
      
      setIsConnected(false);
      setStats({
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
    } catch (err) {
      console.error('Error disconnecting Fitbit:', err);
      setError('Failed to disconnect Fitbit');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Check for connection status and URL parameters on mount
  useEffect(() => {
    const init = async () => {
      // Only proceed if user is authenticated
      if (!user?.id) {
        console.log('User not authenticated, skipping Fitbit check');
        return;
      }

      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const fitbitConnected = urlParams.get('fitbit_connected');
      const error = urlParams.get('error');
      
      if (fitbitConnected === 'true') {
        console.log('Fitbit connection successful');
        setIsConnected(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (error) {
        console.error('Fitbit connection error:', error);
        setError(decodeURIComponent(error));
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      const connected = await checkConnection();
      if (connected) {
        await fetchHealthData();
      }
    };
    
    init();
  }, [user?.id, checkConnection, fetchHealthData]);

  const handleRefresh = useCallback(async () => {
    await fetchHealthData();
  }, [fetchHealthData]);

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Health Stats</CardTitle>
              <CardDescription>
                {stats.lastSynced
                  ? `Last synced ${formatDistanceToNow(new Date(stats.lastSynced), { addSuffix: true })}`
                  : 'Connect your Fitbit to sync health data'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isConnected && (
                <Button onClick={handleRefresh} disabled={isLoading} variant="outline" size="sm">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Syncing...' : 'Refresh'}
                </Button>
              )}
              {isConnected && (
                <Button 
                  onClick={disconnectFitbit} 
                  disabled={isLoading} 
                  variant="destructive" 
                  size="sm"
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!user?.id ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Please log in to connect your Fitbit account.</span>
              </div>
            </div>
          ) : !isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Connect your Fitbit account to track your health metrics automatically.</span>
              </div>
              <Button 
                onClick={connectFitbit} 
                disabled={isLoading} 
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Connecting...' : 'Connect Fitbit'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Steps" 
                value={stats.steps?.toLocaleString() || '0'} 
                icon={<Activity className="h-5 w-5" />}
                goal={stats.goal}
                progress={stats.progress || 0}
              />
              <StatCard 
                title="Calories" 
                value={stats.calories?.toLocaleString() || '0'} 
                icon={<Zap className="h-5 w-5" />}
              />
              <StatCard 
                title="Active Minutes" 
                value={stats.activeMinutes?.toString() || '0'} 
                icon={<HeartPulse className="h-5 w-5" />}
              />
              <StatCard 
                title="Sleep" 
                value={stats.sleepDuration ? `${stats.sleepDuration.toFixed(1)}h` : '--'} 
                icon={<Moon className="h-5 w-5" />}
              />
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
    </div>
  );
};

export default HealthIntegration;
