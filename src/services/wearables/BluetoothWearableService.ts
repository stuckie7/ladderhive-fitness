
import { WearableDevice, FitnessData, UserProfile, FitnessGoals } from '../../types/wearable';

class BluetoothWearableService {
  private connectedDevices: Map<string, BluetoothDevice> = new Map();
  private userProfile: UserProfile | null = null;
  private fitnessGoals: FitnessGoals | null = null;

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async getDevices(): Promise<WearableDevice[]> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported');
    }

    try {
      const devices = await navigator.bluetooth.getDevices();
      return devices.map(device => ({
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: device.gatt?.connected || false,
        type: 'bluetooth' as const,
        batteryLevel: undefined,
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  async requestDevice(): Promise<WearableDevice> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported');
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['battery_service'] }
        ],
        optionalServices: ['device_information']
      });

      return {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: false,
        type: 'bluetooth' as const,
        batteryLevel: undefined,
        lastSync: new Date()
      };
    } catch (error) {
      console.error('Error requesting device:', error);
      throw error;
    }
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      const devices = await navigator.bluetooth.getDevices();
      const device = devices.find(d => d.id === deviceId);
      
      if (!device) {
        throw new Error('Device not found');
      }

      if (!device.gatt) {
        throw new Error('Device does not support GATT');
      }

      const server = await device.gatt.connect();
      this.connectedDevices.set(deviceId, device);
      
      console.log('Connected to device:', device.name);
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      return false;
    }
  }

  async disconnect(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device && device.gatt?.connected) {
      device.gatt.disconnect();
      this.connectedDevices.delete(deviceId);
      console.log('Disconnected from device:', device.name);
    }
  }

  subscribe(deviceId: string, callback: (data: FitnessData) => void): () => void {
    // Mock subscription for now
    const interval = setInterval(() => {
      callback({
        timestamp: new Date().toISOString(),
        deviceId: deviceId,
        heartRate: Math.floor(Math.random() * 40) + 60,
        steps: Math.floor(Math.random() * 1000),
        caloriesBurned: Math.floor(Math.random() * 100),
        distance: Math.random() * 5
      });
    }, 5000);

    return () => clearInterval(interval);
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  setFitnessGoals(goals: FitnessGoals): void {
    this.fitnessGoals = goals;
  }

  isAvailable(): boolean {
    return this.isSupported();
  }

  isDeviceConnected(): boolean {
    return this.connectedDevices.size > 0;
  }

  setHeartRateCallback(callback: (heartRate: number) => void): void {
    // Implementation for heart rate callback
  }

  setBatteryLevelCallback(callback: (batteryLevel: number) => void): void {
    // Implementation for battery level callback
  }

  async getConnectedDevices(): Promise<WearableDevice[]> {
    return this.getDevices().then(devices => 
      devices.filter(device => device.connected)
    );
  }
}

export const bluetoothWearableService = new BluetoothWearableService();
export default BluetoothWearableService;
