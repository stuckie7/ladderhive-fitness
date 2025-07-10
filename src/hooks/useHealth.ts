import { useState, useEffect, useCallback } from 'react';
import { HealthService, HealthDataPoint } from '@/services/healthService';
import { useAuth } from '@/context/AuthContext';

export const useHealth = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);

  // Check if health is available
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await HealthService.isAvailable();
      setIsAvailable(available);
    };
    checkAvailability();
  }, []);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    if (!isAvailable) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const granted = await HealthService.requestPermissions();
      setIsAuthorized(granted);
      
      return granted;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Failed to request health permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  // Sync health data
  const syncHealthData = useCallback(async (daysBack = 7) => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (!isAuthorized) {
        const granted = await requestPermissions();
        if (!granted) {
          setError('Health permissions not granted');
          return false;
        }
      }

      const success = await HealthService.syncHealthData(user.id, daysBack);
      if (success) {
        setLastSynced(new Date());
        // Fetch the updated data
        const { data, error: fetchError } = await supabase
          .from('health_data')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (!fetchError && data) {
          setHealthData(data);
        }
      }
      return success;
    } catch (err) {
      console.error('Error syncing health data:', err);
      setError('Failed to sync health data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthorized, requestPermissions]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('health_data')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (!error && data) {
          setHealthData(data);
        }
      }
    };

    loadInitialData();
  }, [user?.id]);

  return {
    isAvailable,
    isAuthorized,
    isLoading,
    error,
    lastSynced,
    healthData,
    requestPermissions,
    syncHealthData
  };
};
