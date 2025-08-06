import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { invokeWithAuth } from '@/lib/invokeWithAuth';
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
  } = useQuery<{ stale?: boolean; stats: Partial<HealthStats> }, Error>({
    queryKey: ['fitbit-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      
      const today = new Date().toLocaleDateString('en-CA');
      // First try today
      const { data: todayData, error: todayError } = await invokeWithAuth<{ stale?: boolean; stats: Partial<HealthStats> }>('fitbit-fetch-data', {
        method: 'POST',
        body: JSON.stringify({ date: today }),
      });
      if (todayError) throw todayError;
      if (todayData && todayData.stats && Object.values(todayData.stats).some(v => v)) {
        return todayData;
      }

      // Fallback: try yesterday (helps when user’s timezone hasn’t rolled over yet or first sync of the day)
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toLocaleDateString('en-CA');
      const { data: yData, error: yError } = await invokeWithAuth<{ stale?: boolean; stats: Partial<HealthStats> }>('fitbit-fetch-data', {
        method: 'POST',
        body: JSON.stringify({ date: yesterday }),
      });
      if (yError) throw yError;
      return yData ?? { stats: {} };
    },
    enabled: !!user && isConnected,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  // Determine staleness returned by the edge function
  const isStale: boolean = Boolean((statsData as any)?.stale);
  // Always surface whatever stats were returned, even if they are marked stale
  const stats: Partial<HealthStats> = (statsData as any)?.stats ?? {};

  const fetchHealthData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await queryClient.invalidateQueries({ queryKey: ['fitbit-stats', user?.id] });
      await refetchStats();
    } finally {
      setIsLoading(false);
    }
  }, [refetchStats]);

  const checkConnectionAndFetch = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // Hit the profile endpoint; if it returns 401 we're simply not connected yet.
      const { error: profileError } = await invokeWithAuth('get-fitbit-profile', { method: 'GET' });

      // A 401 status from the edge function means the user hasn't connected their Fitbit.
      if ((profileError as any)?.status === 401) {
        setIsConnected(false);
        return;
      }

      if (profileError) {
        console.error('Error fetching Fitbit profile:', profileError);
        throw profileError;
      }

      // If we get here, the user is connected to Fitbit
      setIsConnected(true);
      
      // If connected, immediately fetch the latest health data
      await fetchHealthData();
    } catch (err: any) {
      console.error('Error in checkConnectionAndFetch:', err);
      // If any part of the process fails, assume not connected 
      setIsConnected(false);
      // Only surface the error if it's not a 401 (which just means not connected yet)
      if ((err as any)?.status !== 401) {
        // Only surface the error in UI for connected users; avoid global toast
        setError(err.message || 'Failed to check Fitbit connection');
      }
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
      queryClient.removeQueries({ queryKey: ['fitbit-stats', user.id] });
      toast({ title: 'Success', description: 'Fitbit account disconnected.' });
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Fitbit.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  

  return { isLoading, error, isConnected, stats, connectFitbit, disconnectFitbit, fetchHealthData, isStale };
};
