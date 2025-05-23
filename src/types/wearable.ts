export type WearableDeviceType = 
  | 'heart_rate_monitor' 
  | 'fitness_band' 
  | 'smartwatch' 
  | 'smart_scale' 
  | 'cycling_sensor' 
  | 'running_pod' 
  | 'strength_trainer';

export interface WearableDevice {
  id: string;
  name: string;
  type: WearableDeviceType;
  connected: boolean;
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
  timestamp: Date;
  deviceId: string;
  
  // Activity metrics
  steps?: number;
  distance?: number; // meters
  caloriesBurned?: number;
  activeMinutes?: number;
  
  // Health metrics
  heartRate?: number; // bpm
  heartRateVariability?: number; // ms
  bloodOxygen?: number; // SpO2 %
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    meanArterialPressure?: number;
  };
  
  // Body composition
  weight?: number; // kg
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  hydration?: number; // %
  
  // Workout specific
  workoutType?: string;
  workoutDuration?: number; // seconds
  workoutIntensity?: number; // 1-10
  
  // Sleep metrics
  sleepScore?: number; // 0-100
  sleepStages?: {
    awake: number; // minutes
    light: number;
    deep: number;
    rem: number;
  };
  
  // Environmental
  temperature?: number; // °C
  elevation?: number; // meters
  
  // Additional metrics
  stressLevel?: number; // 0-100
  vo2Max?: number; // ml/kg/min
  respiratoryRate?: number; // breaths/min
  
  // Raw data
  rawData?: any;
}

export interface DeviceConnectionOptions {
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  connectionTimeout?: number;
  requestEcho?: boolean;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  maxHeartRate?: number;
  restingHeartRate?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface FitnessGoals {
  dailySteps?: number;
  weeklyWorkouts?: number;
  targetWeight?: number;
  targetBodyFat?: number;
  targetWorkoutMinutes?: number;
  targetCaloriesBurned?: number;
  targetSleepHours?: number;
}

export interface WearableService {
  // Device management
  requestDevice(filters?: Partial<WearableDevice>): Promise<WearableDevice | null>;
  connect(deviceId: string, options?: DeviceConnectionOptions): Promise<boolean>;
  disconnect(deviceId: string): Promise<void>;
  getDeviceList(): Promise<WearableDevice[]>;
  
  // Data operations
  getFitnessData(
    deviceId: string, 
    options?: { 
      startDate?: Date; 
      endDate?: Date; 
      metrics?: string[] 
    }
  ): Promise<FitnessData[]>;
  
  // Real-time updates
  subscribeToUpdates(
    deviceId: string, 
    callback: (data: FitnessData) => void
  ): Promise<() => void>;
  
  // Device info
  getDeviceInfo(deviceId: string): Promise<Partial<WearableDevice>>;
  getBatteryLevel(deviceId: string): Promise<number | null>;
  
  // Configuration
  setUserProfile(profile: UserProfile): Promise<void>;
  setGoals(goals: FitnessGoals): Promise<void>;
}

export interface DeviceStorage {
  // Device management
  saveDevice(device: WearableDevice): Promise<void>;
  getDevice(deviceId: string): Promise<WearableDevice | null>;
  getDevices(): Promise<WearableDevice[]>;
  deleteDevice(deviceId: string): Promise<void>;
  
  // Data operations
  saveFitnessData(deviceId: string, data: FitnessData): Promise<void>;
  getFitnessData(
    deviceId: string, 
    options?: { startDate?: Date; endDate?: Date }
  ): Promise<FitnessData[]>;
  
  // Clear all data
  clear(): Promise<void>;
}
