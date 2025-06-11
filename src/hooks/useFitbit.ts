import { useState, useEffect, useCallback } from 'react';
import { connectFitbit, disconnectFitbit, getFitbitConnection, fetchFitbitData } from '@/lib/fitbit';

export function useFitbit() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connection = await getFitbitConnection();
      setIsConnected(!!connection);
      
      if (connection) {
        const data = await fetchFitbitData();
        setHealthData(data);
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
      
      const { authUrl } = await connectFitbit();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting Fitbit:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect Fitbit'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await disconnectFitbit();
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
