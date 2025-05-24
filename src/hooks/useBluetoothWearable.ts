import { useState, useEffect, useCallback, useRef } from 'react';
import { BluetoothWearableService, bluetoothWearableService } from '../services/wearables/BluetoothWearableService';
import { WearableDevice, FitnessData, UserProfile, FitnessGoals } from '../types/wearable';

type BluetoothStatus = 'idle' | 'searching' | 'connecting' | 'connected' | 'error' | 'disconnected';

interface UseBluetoothWearableReturn {
  // Service instance
  service: typeof bluetoothWearableService;
  
  // State
  isSupported: boolean;
  status: BluetoothStatus;
  error: Error | null;
  devices: WearableDevice[];
  connectedDevice: WearableDevice | null;
  fitnessData: FitnessData[];
  
  // Actions
  requestDevice: () => Promise<WearableDevice>;
  connect: (deviceId: string) => Promise<boolean>;
  disconnect: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
  setUserProfile: (profile: UserProfile) => void;
  setFitnessGoals: (goals: FitnessGoals) => void;
  clearError: () => void;
}

export function useBluetoothWearable(): UseBluetoothWearableReturn {
  const [status, setStatus] = useState<BluetoothStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<WearableDevice | null>(null);
  const [fitnessData, setFitnessData] = useState<FitnessData[]>([]);
  
  const notificationUnsubscribe = useRef<(() => void) | null>(null);
  const isMounted = useRef(true);
  
  // Check if Web Bluetooth is supported
  const isSupported = bluetoothWearableService.isSupported();
  
  // Update device list
  const updateDevices = useCallback(async () => {
    try {
      const deviceList = await bluetoothWearableService.getDevices();
      
      if (isMounted.current) {
        setDevices(deviceList);
        
        // Update connected device if it exists
        const connected = deviceList.find(device => device.connected) || null;
        if (connected) {
          setConnectedDevice(connected);
        }
      }
    } catch (err) {
      console.error('Error updating devices:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, []);
  
  // Handle device disconnection
  const handleDisconnect = useCallback((deviceId: string) => {
    console.log(`Device ${deviceId} disconnected`);
    if (isMounted.current) {
      setStatus('disconnected');
      setConnectedDevice(prev => (prev?.id === deviceId ? null : prev));
      
      // Clean up notification subscription
      if (notificationUnsubscribe.current) {
        notificationUnsubscribe.current();
        notificationUnsubscribe.current = null;
      }
      
      // Update device list
      updateDevices();
    }
  }, [updateDevices]);
  
  // Set up event listeners and initial state
  useEffect(() => {
    isMounted.current = true;
    
    // Initial device list update
    if (isSupported) {
      updateDevices();
    }
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
      
      // Clean up notification subscription
      if (notificationUnsubscribe.current) {
        notificationUnsubscribe.current();
      }
      
      // Disconnect from all devices
      devices.forEach(device => {
        if (device.connected) {
          bluetoothWearableService.disconnect(device.id).catch(console.error);
        }
      });
    };
  }, [isSupported, updateDevices, devices]);
  
  // Request a new device
  const requestDevice = useCallback(async (): Promise<WearableDevice> => {
    if (!isSupported) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }
    
    try {
      setStatus('searching');
      setError(null);
      
      const device = await bluetoothWearableService.requestDevice();
      
      if (!device) {
        throw new Error('No device was selected');
      }
      
      if (isMounted.current) {
        await updateDevices();
      }
      
      return device;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMounted.current) {
        setError(error);
        setStatus('error');
      }
      throw error;
    } finally {
      if (isMounted.current && status !== 'connected') {
        setStatus('idle');
      }
    }
  }, [isSupported, status, updateDevices]);
  
  // Connect to a device
  const connect = useCallback(async (deviceId: string): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }
    
    try {
      setStatus('connecting');
      setError(null);
      
      // Connect to the device
      const success = await bluetoothWearableService.connect(deviceId);
      
      if (success && isMounted.current) {
        setStatus('connected');
        
        // Update device list
        await updateDevices();
        
        // Set up notifications
        notificationUnsubscribe.current = bluetoothWearableService.subscribe(
          deviceId,
          (data) => {
            if (isMounted.current) {
              setFitnessData(prevData => [...prevData, data]);
            }
          }
        );
      }
      
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMounted.current) {
        setError(error);
        setStatus('error');
      }
      throw error;
    } finally {
      if (isMounted.current && status !== 'connected') {
        setStatus('idle');
      }
    }
  }, [isSupported, status, updateDevices]);
  
  // Disconnect from a device
  const disconnect = useCallback(async (deviceId: string): Promise<void> => {
    try {
      await bluetoothWearableService.disconnect(deviceId);
      
      if (isMounted.current) {
        setStatus('disconnected');
        setConnectedDevice(null);
        
        // Clean up notification subscription
        if (notificationUnsubscribe.current) {
          notificationUnsubscribe.current();
          notificationUnsubscribe.current = null;
        }
        
        // Update device list
        await updateDevices();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMounted.current) {
        setError(error);
        setStatus('error');
      }
      throw error;
    } finally {
      if (isMounted.current && status !== 'disconnected') {
        setStatus('idle');
      }
    }
  }, [status, updateDevices]);
  
  // Set user profile
  const setUserProfile = useCallback((profile: UserProfile) => {
    bluetoothWearableService.setUserProfile(profile);
  }, []);
  
  // Set fitness goals
  const setFitnessGoals = useCallback((goals: FitnessGoals) => {
    bluetoothWearableService.setFitnessGoals(goals);
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    if (isMounted.current) {
      setError(null);
      if (status === 'error') {
        setStatus('idle');
      }
    }
  }, [status]);
  
  return {
    // Service instance
    service: bluetoothWearableService,
    
    // State
    isSupported,
    status,
    error,
    devices,
    connectedDevice,
    fitnessData,
    
    // Actions
    requestDevice,
    connect,
    disconnect,
    refreshDevices: updateDevices,
    setUserProfile,
    setFitnessGoals,
    clearError,
  };
}

export default useBluetoothWearable;
