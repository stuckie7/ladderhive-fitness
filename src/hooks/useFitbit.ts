
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useFitbit() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('No authenticated user found');
        setIsConnected(false);
        return;
      }

      console.log('Checking Fitbit connection for user:', session.user.id);
      
      // Use maybeSingle() to handle cases where no token exists
      const { data, error } = await supabase
        .from('fitbit_tokens')
        .select('expires_at')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking Fitbit connection:', error);
        // Don't treat RLS errors as real errors, just assume not connected
        if (error.code === 'PGRST301' || error.message.includes('RLS') || error.message.includes('permission')) {
          console.log('RLS/Permission issue, treating as not connected');
          setIsConnected(false);
        } else {
          throw new Error('Failed to check Fitbit connection');
        }
        return;
      }

      if (!data) {
        console.log('No Fitbit token found');
        setIsConnected(false);
        return;
      }

      const isTokenValid = new Date(data.expires_at) > new Date();
      setIsConnected(isTokenValid);
      
      if (isTokenValid) {
        // Mock health data for now
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
        setHealthData(mockData);
      }
    } catch (err) {
      console.error('Error checking Fitbit connection:', err);
      setError(err instanceof Error ? err : new Error('Failed to check Fitbit connection'));
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify authentication before attempting connection
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Please log in to connect your Fitbit account.');
      }

      console.log('Initiating Fitbit connection...');
      
      const { data, error } = await supabase.functions.invoke('fitbit-oauth');
      
      if (error) {
        throw new Error(error.message || 'Failed to get authorization URL');
      }
      
      if (!data?.url) {
        throw new Error('No authorization URL returned');
      }
      
      console.log('Opening Fitbit authorization in new window:', data.url);
      
      // Open in a new window/tab to avoid iframe restrictions
      const newWindow = window.open(data.url, 'fitbit-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
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
      console.error('Error connecting Fitbit:', err);
      const error = err instanceof Error ? err : new Error('Failed to connect Fitbit');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('fitbit_tokens')
        .delete()
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      setIsConnected(false);
      setHealthData(null);
    } catch (err) {
      console.error('Error disconnecting Fitbit:', err);
      const error = err instanceof Error ? err : new Error('Failed to disconnect Fitbit');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    error,
    healthData,
    connect,
    disconnect,
    refresh: checkConnection,
  };
}
