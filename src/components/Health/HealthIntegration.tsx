import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, HeartPulse, Zap, Loader2, AlertCircle, RefreshCw, Moon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchFitbitData } from '@/lib/fitbit';

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

      // Get current session for auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        setError('Please log in to connect your Fitbit account.');
        return;
      }

      console.log('Initiating Fitbit connection...');
      
      // Make the request to get the Fitbit authorization URL from our 'fitbit-initiate' Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fitbit-initiate', {
        // Ensure you are passing any necessary body if your function expects it,
        // or an empty object if it doesn't.
        // For 'fitbit-initiate', it primarily relies on the Authorization header
        // and generates state/verifier internally.
      }
      // Note: The invoke method automatically includes the Authorization header with the user's session token.
      );
      
      if (functionError) {
        console.error('Error invoking fitbit-initiate:', functionError);
        throw new Error(functionError.message || 'Failed to get authorization URL from fitbit-initiate');
      }
      
      const fitbitAuthUrl = functionData?.url; // Assuming the function returns { url: "..." }

      if (!fitbitAuthUrl) {
        console.error('No authorization URL returned from fitbit-initiate:', functionData);
        throw new Error('No authorization URL returned from fitbit-initiate');
      }
      
      console.log('Opening Fitbit authorization in new window:', fitbitAuthUrl);
      
      // Open in a new window/tab to avoid iframe restrictions
      const newWindow = window.open(fitbitAuthUrl, 'fitbit-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!newWindow) {
        throw new Error('Failed to open authorization window. Please allow popups for this site.');
      }
      
      // Listen for the window to close (user completed or cancelled auth)
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          // Check connection status after window closes
          setTimeout(() => {
            checkConnection();
          }, 1000);
        }
      }, 1000);
      
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
      const fitbitData = await fetchFitbitData();
      const newStats = {
        ...fitbitData,
        lastSynced: fitbitData.lastSynced ? new Date(fitbitData.lastSynced) : null,
      };
      setStats(newStats);
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
      const fitbitConnectedParam = urlParams.get('fitbit_connected');
      const errorParam = urlParams.get('error');
      
      let wasConnectedViaParam = false;
      if (fitbitConnectedParam === 'true') {
        console.log('Fitbit connection successful (from URL param)');
        setIsConnected(true); // Set state
        wasConnectedViaParam = true;
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (errorParam) {
        console.error('Fitbit connection error (from URL param):', decodeURIComponent(errorParam));
        setError(decodeURIComponent(errorParam));
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // If not already set as connected by URL params, then check the DB.
      // This also ensures that if URL params were stale or incorrect,
      // the DB (source of truth) is checked.
      if (!wasConnectedViaParam) {
          await checkConnection(); // This will call setIsConnected internally
      }
    };
    
    init();
  }, [user?.id, checkConnection]); // Removed fetchHealthData from this dependency array

  // New useEffect to fetch data when isConnected becomes true (and user is available)
  useEffect(() => {
    if (isConnected && user?.id) {
      console.log('Fitbit is connected and user is available, attempting to fetch health data...');
      fetchHealthData();
    }
  }, [isConnected, user?.id, fetchHealthData]); // Dependencies ensure this runs when needed

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
