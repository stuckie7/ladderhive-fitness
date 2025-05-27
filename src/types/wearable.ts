
export type WearableDeviceType = 'fitness_tracker' | 'smartwatch' | 'heart_rate_monitor';

export interface WearableDevice {
  id: string;
  name: string;
  connected: boolean;
  type: WearableDeviceType;
  batteryLevel?: number;
  lastSync: Date;
}

export interface FitnessData {
  timestamp: string;
  heartRate?: number;
  steps?: number;
  calories?: number;
  distance?: number;
}

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface FitnessGoals {
  dailySteps: number;
  weeklyWorkouts: number;
  targetWeight?: number;
  targetHeartRate?: number;
}

export interface DeviceConnectionOptions {
  autoConnect?: boolean;
  syncInterval?: number;
  enableNotifications?: boolean;
}
