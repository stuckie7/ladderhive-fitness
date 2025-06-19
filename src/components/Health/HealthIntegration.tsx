import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, HeartPulse, Zap, Loader2, AlertCircle, RefreshCw, Moon, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { fetchFitbitData } from '@/lib/fitbit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

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
  <Card className="bg-slate-800/50 border-slate-800">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-slate-300">{title}</p>
          <p className="text-4xl font-bold text-slate-100">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-sky-500/20 text-sky-500">
          {icon}
        </div>
      </div>
      {goal !== undefined && progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1 text-slate-300">
            <span>Progress</span>
            <span className="font-semibold text-slate-200">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
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

interface HealthIntegrationProps {
  initialStepGoal?: number;
}

const HealthIntegration: React.FC<HealthIntegrationProps> = ({ initialStepGoal = 10000 }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stepGoal, setStepGoal] = useState(initialStepGoal);
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

  useEffect(() => {
    if (initialStepGoal) {
        setStepGoal(initialStepGoal);
    }
  }, [initialStepGoal]);

  const connectFitbit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        setError('Please log in to connect your Fitbit account.');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError('Please log in to connect your Fitbit account.');
        return;
      }
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fitbit-initiate');

      if (functionError) {
        throw new Error(functionError.message || 'Failed to get authorization URL from fitbit-initiate');
      }
      
      const fitbitAuthUrl = functionData?.url;

      if (!fitbitAuthUrl) {
        throw new Error('No authorization URL returned from fitbit-initiate');
      }
      
      const newWindow = window.open(fitbitAuthUrl, 'fitbit-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!newWindow) {
        throw new Error('Failed to open authorization window. Please allow popups for this site.');
      }
      
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          setTimeout(() => {
            checkConnection();
          }, 1000);
        }
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Fitbit');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const checkConnection = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('fitbit_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('RLS')) {
          setIsConnected(false);
        } else {
          setError('Failed to check Fitbit connection');
          setIsConnected(false);
        }
        return false;
      }
      
      if (!data) {
        setIsConnected(false);
        return false;
      }
      
      const isTokenValid = new Date(data.expires_at) > new Date();
      setIsConnected(isTokenValid);
      return isTokenValid;
    } catch (error) {
      setError('Failed to check Fitbit connection');
      setIsConnected(false);
      return false;
    }
  }, [user?.id]);

  const fetchHealthData = useCallback(async () => {
    if (!user?.id || !isConnected) return;
    
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
        
      if (error) throw error;
      
      setIsConnected(false);
      setStats({
        steps: 0, calories: 0, distance: 0, activeMinutes: 0, heartRate: null,
        sleepDuration: null, lastSynced: null, goal: 10000, progress: 0, workouts: 0
      });
    } catch (err) {
      setError('Failed to disconnect Fitbit');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const init = async () => {
      if (!user?.id) return;

      const urlParams = new URLSearchParams(window.location.search);
      const fitbitConnectedParam = urlParams.get('fitbit_connected');
      const errorParam = urlParams.get('error');
      
      let wasConnectedViaParam = false;
      if (fitbitConnectedParam === 'true') {
        setIsConnected(true);
        wasConnectedViaParam = true;
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (!wasConnectedViaParam) {
          await checkConnection();
      }
    };
    
    init();
  }, [user?.id, checkConnection]);

  useEffect(() => {
    if (isConnected && user?.id) {
      fetchHealthData();
    }
  }, [isConnected, user?.id, fetchHealthData]);

  const handleRefresh = useCallback(async () => {
    await fetchHealthData();
  }, [fetchHealthData]);

  const handleSaveGoal = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save a goal.", variant: "destructive" });
      return;
    }
    if (!stepGoal || stepGoal <= 0) {
      toast({ title: "Invalid Goal", description: "Please enter a valid step goal.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ daily_step_goal: stepGoal })
        .eq('id', user.id);

      if (error) throw error;

      setStats(prevStats => ({
        ...prevStats,
        goal: stepGoal,
        progress: prevStats.steps ? (prevStats.steps / stepGoal) * 100 : 0
      }));

      toast({ title: "Success", description: "Your step goal has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save step goal.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-slate-100">Health Stats</CardTitle>
              <CardDescription className="text-slate-400">
                {stats.lastSynced
                  ? `Last synced ${formatDistanceToNow(new Date(stats.lastSynced), { addSuffix: true })}`
                  : 'Connect your Fitbit to sync health data'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isConnected && (
                <Button onClick={handleRefresh} disabled={isLoading} variant="outline" size="sm" className="text-slate-300 hover:text-slate-100 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Syncing...' : 'Refresh'}
                </Button>
              )}
              {isConnected && (
                <Button onClick={disconnectFitbit} disabled={isLoading} variant="destructive" size="sm">
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!user?.id ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Please log in to connect your Fitbit account.</span>
            </div>
          ) : !isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Connect your Fitbit account to track your health metrics automatically.</span>
              </div>
              <Button onClick={connectFitbit} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                {isLoading ? 'Connecting...' : 'Connect Fitbit'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Steps" value={stats.steps?.toLocaleString() || '0'} icon={<Activity className="h-6 w-6" />} goal={stats.goal} progress={stats.progress || 0} />
              <StatCard title="Calories" value={stats.calories?.toLocaleString() || '0'} icon={<Zap className="h-6 w-6" />} />
              <StatCard title="Active Minutes" value={stats.activeMinutes?.toString() || '0'} icon={<HeartPulse className="h-6 w-6" />} />
              <StatCard title="Sleep" value={stats.sleepDuration ? `${stats.sleepDuration.toFixed(1)}h` : '--'} icon={<Moon className="h-6 w-6" />} />
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

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Target className="h-5 w-5" />
              Your Daily Goal
            </CardTitle>
            <CardDescription className="text-slate-400">Set a daily step goal to personalize your progress tracking.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-4">
            <div className="grid flex-grow items-center gap-1.5">
              <Label htmlFor="step-goal" className="text-slate-400">Steps</Label>
              <Input
                id="step-goal"
                type="number"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="text-base border-slate-700 placeholder:text-slate-300 text-sky-400 font-bold"
                placeholder="e.g., 10000"
                disabled={isSaving}
              />
            </div>
            <Button onClick={handleSaveGoal} disabled={isSaving} className="btn-fitness-primary w-full md:w-auto text-white">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthIntegration;
