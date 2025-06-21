import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface HealthStats {
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

export const useFitbitData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // react-query manages stats
  const queryClient = useQueryClient();
  const {
    data: statsData,
    isFetching: isFetchingStats,
    refetch: refetchStats,
    error: statsError,
  } = useQuery<{ stale?: boolean; stats: Partial<HealthStats> }>(
    ['fitbit-stats', user?.id],
    async () => {
      if (!user) throw new Error('No user');
      const today = new Date().toLocaleDateString('en-CA');
      const { data, error } = await supabase.functions.invoke('fitbit-fetch-data', {
        method: 'POST',
        body: { date: today },
      });
      if (error) throw error;
      return data;
    },
    {
      enabled: !!user && isConnected, // only when connected
      staleTime: 10 * 60 * 1000,
      refetchInterval: 10 * 60 * 1000,
      select: (data) => data?.stale ? undefined : data, // ignore stale payloads
      onError: (err: any) => {
        if (err?.status === 429) {
          toast({ title: 'Fitbit limit reached', description: 'Data will refresh again later.', variant: 'default' });
        }
      },
    }
  );

  const stats = statsData?.stats || {};

  const fetchHealthData = useCallback(async () => {
    await refetchStats();
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
      const { data: healthData, error: healthError } = await supabase.functions.invoke('fitbit-fetch-data', {
        method: 'POST',
        body: { date: today },
      });
      if (healthError) {
        // If Fitbit API quota exceeded, healthError.status will be 429
        if ((healthError as any).status === 429) {
          console.warn('Fitbit rate limit hit – displaying stale data');
          toast({ title: 'Fitbit limit reached', description: 'Data will refresh again in a few minutes.', variant: 'default' });
          return; // keep existing stats
        }
        throw healthError;
      }
      if (!healthData?.stale) {
        setStats(healthData?.stats || {});
      }
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('429')) {
        console.warn('Fitbit rate limit (catch)');
        toast({ title: 'Fitbit limit reached', description: 'Data will refresh again later.', variant: 'default' });
        return;
      }
      setError(err.message || 'Failed to fetch Fitbit data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkConnectionAndFetch = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // First, check if we can get a profile. If this fails, the user is not connected.
      await supabase.functions.invoke('get-fitbit-profile', { method: 'GET' });
      setIsConnected(true);
      // If connected, immediately fetch the latest health data.
      await fetchHealthData();
    } catch (err: any) {
      // If any part of the process fails, assume not connected. 
      // No error is set here because this is an expected state for users who haven't connected Fitbit.
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchHealthData]);

  useEffect(() => {
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fitbit_connected') === 'true') {
      setIsConnected(true);
      fetchHealthData();
      toast({ title: 'Success!', description: 'Your Fitbit account has been connected.', variant: 'default' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.has('error')) {
      setError(decodeURIComponent(urlParams.get('error')!));
      toast({ title: 'Connection Error', description: decodeURIComponent(urlParams.get('error')!), variant: 'destructive' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      checkConnectionAndFetch();
    }
  }, [user, checkConnectionAndFetch, fetchHealthData, toast]);

  const connectFitbit = async () => {
    if (!user) {
      setError('Please log in to connect your Fitbit account.');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fitbit-initiate');
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Fitbit connection.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFitbit = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;

      setIsConnected(false);
      queryClient.removeQueries(['fitbit-stats', user.id]);
      toast({ title: 'Success', description: 'Fitbit account disconnected.' });
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Fitbit.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  

  return { isLoading, error, isConnected, stats, connectFitbit, disconnectFitbit, fetchHealthData };
};
