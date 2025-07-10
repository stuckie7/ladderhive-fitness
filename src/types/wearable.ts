
export type WearableDeviceType = 
  | 'fitness_tracker' 
  | 'smartwatch' 
  | 'heart_rate_monitor'
  | 'fitness_band' 
  | 'smart_scale' 
  | 'cycling_sensor' 
  | 'running_pod' 
  | 'strength_trainer'
  | 'bluetooth';

export interface WearableDevice {
  id: string;
  name: string;
  connected: boolean;
  type: WearableDeviceType;
  batteryLevel?: number;
  lastSync?: Date;
  manufacturer?: string;
  model?: string;
  rssi?: number;
  serviceUuids?: string[];
  maxHeartRate?: number;
  features?: string[];
}

export interface FitnessData {
  timestamp: string;
  deviceId?: string;
  heartRate?: number;
  steps?: number;
  calories?: number;
  caloriesBurned?: number;
  distance?: number;
  activeMinutes?: number;
  heartRateVariability?: number;
  bloodOxygen?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    meanArterialPressure?: number;
  };
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  hydration?: number;
  workoutType?: string;
  workoutDuration?: number;
  workoutIntensity?: number;
  sleepScore?: number;
  sleepStages?: {
    awake: number;
    light: number;
    deep: number;
    rem: number;
  };
  temperature?: number;
  elevation?: number;
  stressLevel?: number;
  vo2Max?: number;
  respiratoryRate?: number;
  rawData?: any;
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
