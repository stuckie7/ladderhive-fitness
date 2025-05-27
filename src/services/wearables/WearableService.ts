
import type { WearableDevice, FitnessData, UserProfile, FitnessGoals, DeviceConnectionOptions } from './types';

export interface WearableService {
  // Device management
  isAvailable(): boolean;
  isDeviceConnected(): boolean;
  setHeartRateCallback(callback: (heartRate: number) => void): void;
  setBatteryLevelCallback(callback: (batteryLevel: number) => void): void;
  
  // Connection methods
  connect(): Promise<WearableDevice>;
  disconnect(): Promise<void>;
  getConnectedDevices(): Promise<WearableDevice[]>;
}

export type { WearableDevice, FitnessData, UserProfile, FitnessGoals, DeviceConnectionOptions };
