import { GATT_SERVICES, GATT_CHARACTERISTICS } from './constants/gatt';
import { 
  WearableDevice, 
  FitnessData, 
  DeviceConnectionOptions,
  UserProfile,
  FitnessGoals
} from './types';
import {
  WearableError,
  DeviceNotFoundError,
  DeviceNotConnectedError,
  ServiceNotFoundError,
  CharacteristicNotFoundError,
  PermissionDeniedError,
  TimeoutError,
  DataProcessingError
} from './utils/errors';
import { DataViewWithHelpers } from './utils/bufferUtils';
import {
  processHeartRateData,
  processBatteryLevel,
  processDeviceInformation,
  processCyclingSpeedAndCadenceData,
  processRunningSpeedAndCadenceData
} from './utils/dataProcessors';

type NotificationCallback = (data: FitnessData) => void;
type DeviceDisconnectCallback = (deviceId: string) => void;

export class BluetoothWearableService {
  private static instance: BluetoothWearableService;
  
  private devices: Map<string, BluetoothDevice> = new Map();
  private deviceInfo: Map<string, Partial<WearableDevice>> = new Map();
  private notificationCallbacks: Map<string, Set<NotificationCallback>> = new Map();
  private disconnectCallbacks: Map<string, Set<DeviceDisconnectCallback>> = new Map();
  private notificationCleanups: Map<string, () => void> = new Map();
  
  private userProfile: UserProfile | null = null;
  private fitnessGoals: FitnessGoals | null = null;
  
  // Connection options with defaults
  private connectionOptions: Required<DeviceConnectionOptions> = {
    autoReconnect: true,
    reconnectAttempts: 3,
    connectionTimeout: 10000, // 10 seconds
    requestEcho: false
  };

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the BluetoothWearableService
   */
  public static getInstance(): BluetoothWearableService {
    if (!BluetoothWearableService.instance) {
      BluetoothWearableService.instance = new BluetoothWearableService();
    }
    return BluetoothWearableService.instance;
  }

  /**
   * Check if Web Bluetooth is supported in the current browser
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Request Bluetooth device from the user
   */
  public async requestDevice(
    filters: BluetoothRequestDeviceFilter[] = [],
    options: DeviceConnectionOptions = {}
  ): Promise<WearableDevice> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }

    try {
      // Update connection options if provided
      this.connectionOptions = { ...this.connectionOptions, ...options };

      // Request device from the user
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: filters.length === 0,
        filters: filters.length > 0 ? filters : undefined,
        optionalServices: [
          GATT_SERVICES.BATTERY,
          GATT_SERVICES.DEVICE_INFORMATION,
          GATT_SERVICES.HEART_RATE,
          GATT_SERVICES.FITNESS_MACHINE,
          GATT_SERVICES.CYCLING_SPEED_AND_CADENCE,
          GATT_SERVICES.RUNNING_SPEED_AND_CADENCE,
        ],
      });

      // Set up disconnect handler
      device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this, device));
      
      // Store the device
      this.devices.set(device.id, device);
      
      // Create device info
      const deviceInfo: WearableDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        type: this.determineDeviceType(device),
        connected: false,
      };
      
      this.deviceInfo.set(device.id, deviceInfo);
      
      return { ...deviceInfo };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          throw new DeviceNotFoundError('No device selected');
        } else if (error.name === 'SecurityError') {
          throw new PermissionDeniedError('Bluetooth permission denied');
        } else if (error.name === 'NotAllowedError') {
          throw new PermissionDeniedError('User cancelled the request');
        }
      }
      throw error;
    }
  }

  /**
   * Connect to a Bluetooth device
   */
  public async connect(deviceId: string, options: DeviceConnectionOptions = {}): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new DeviceNotFoundError(deviceId);
    }

    // Update connection options if provided
    this.connectionOptions = { ...this.connectionOptions, ...options };

    try {
      // Already connected
      if (device.gatt?.connected) {
        return true;
      }

      // Connect to the device
      await device.gatt?.connect();
      
      // Update device info
      const deviceInfo = this.deviceInfo.get(deviceId);
      if (deviceInfo) {
        deviceInfo.connected = true;
        deviceInfo.lastSync = new Date();
      }

      // Discover services and characteristics
      await this.discoverServices(device);
      
      // Set up notifications for relevant characteristics
      await this.setupNotifications(device);

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      
      // Attempt reconnection if autoReconnect is enabled
      if (this.connectionOptions.autoReconnect) {
        return this.attemptReconnect(device, 0);
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from a Bluetooth device
   */
  public async disconnect(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new DeviceNotFoundError(deviceId);
    }

    try {
      // Clean up notifications
      const cleanup = this.notificationCleanups.get(deviceId);
      if (cleanup) {
        cleanup();
        this.notificationCleanups.delete(deviceId);
      }
      
      // Disconnect if connected
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
      
      // Update device info
      const deviceInfo = this.deviceInfo.get(deviceId);
      if (deviceInfo) {
        deviceInfo.connected = false;
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      throw error;
    }
  }

  /**
   * Get a list of all known devices
   */
  public async getDevices(): Promise<WearableDevice[]> {
    return Array.from(this.deviceInfo.values()).map(device => ({
      ...device,
      connected: this.devices.get(device.id)?.gatt?.connected || false
    }));
  }

  /**
   * Get device information
   */
  public async getDeviceInfo(deviceId: string): Promise<Partial<WearableDevice>> {
    const deviceInfo = this.deviceInfo.get(deviceId);
    if (!deviceInfo) {
      throw new DeviceNotFoundError(deviceId);
    }
    
    return { ...deviceInfo };
  }

  /**
   * Get battery level of a device
   */
  public async getBatteryLevel(deviceId: string): Promise<number | null> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new DeviceNotFoundError(deviceId);
    }

    if (!device.gatt?.connected) {
      throw new DeviceNotConnectedError(deviceId);
    }

    try {
      // Get battery service
      const batteryService = await device.gatt.getPrimaryService(GATT_SERVICES.BATTERY);
      
      // Get battery level characteristic
      const batteryLevelChar = await batteryService.getCharacteristic(GATT_CHARACTERISTICS.BATTERY_LEVEL);
      
      // Read battery level
      const batteryLevel = await batteryLevelChar.readValue();
      
      // Process and return battery level (0-100%)
      return batteryLevel.getUint8(0);
    } catch (error) {
      console.error('Error reading battery level:', error);
      return null;
    }
  }

  /**
   * Subscribe to device notifications
   */
  public subscribe(
    deviceId: string,
    callback: (data: FitnessData) => void
  ): () => void {
    if (!this.notificationCallbacks.has(deviceId)) {
      this.notificationCallbacks.set(deviceId, new Set());
    }
    
    const callbacks = this.notificationCallbacks.get(deviceId)!;
    callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      
      // Clean up if no more callbacks
      if (callbacks.size === 0) {
        this.notificationCallbacks.delete(deviceId);
      }
    };
  }

  /**
   * Set the user profile for fitness calculations
   */
  public setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
    
    // Update max heart rate if not provided using common formula
    if (!this.userProfile.maxHeartRate && this.userProfile.age) {
      this.userProfile.maxHeartRate = 220 - this.userProfile.age;
    }
  }

  /**
   * Set fitness goals
   */
  public setFitnessGoals(goals: FitnessGoals): void {
    this.fitnessGoals = goals;
  }

  /**
   * Handle device disconnection
   */
  private handleDisconnect(device: BluetoothDevice): void {
    const deviceId = device.id;
    
    // Update device info
    const deviceInfo = this.deviceInfo.get(deviceId);
    if (deviceInfo) {
      deviceInfo.connected = false;
    }
    
    // Call disconnect callbacks
    const callbacks = this.disconnectCallbacks.get(deviceId);
    if (callbacks) {
      callbacks.forEach(callback => callback(deviceId));
    }
    
    // Attempt reconnection if autoReconnect is enabled
    if (this.connectionOptions.autoReconnect) {
      this.attemptReconnect(device, 0);
    }
  }

  /**
   * Attempt to reconnect to a device
   */
  private async attemptReconnect(device: BluetoothDevice, attempt: number): Promise<boolean> {
    if (attempt >= (this.connectionOptions.reconnectAttempts || 3)) {
      console.error(`Failed to reconnect after ${attempt} attempts`);
      return false;
    }

    console.log(`Attempting to reconnect (${attempt + 1}/${this.connectionOptions.reconnectAttempts})...`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      await device.gatt?.connect();
      
      // Update device info
      const deviceInfo = this.deviceInfo.get(device.id);
      if (deviceInfo) {
        deviceInfo.connected = true;
        deviceInfo.lastSync = new Date();
      }
      
      // Set up notifications again
      await this.setupNotifications(device);
      
      console.log('Reconnection successful');
      return true;
    } catch (error) {
      console.error(`Reconnection attempt ${attempt + 1} failed:`, error);
      return this.attemptReconnect(device, attempt + 1);
    }
  }

  /**
   * Discover services and characteristics for a device
   */
  private async discoverServices(device: BluetoothDevice): Promise<void> {
    if (!device.gatt?.connected) {
      throw new DeviceNotConnectedError(device.id);
    }

    try {
      // Get all primary services
      const services = await device.gatt.getPrimaryServices();
      
      // Process each service
      for (const service of services) {
        try {
          // Get all characteristics for the service
          const characteristics = await service.getCharacteristics();
          
          // Update device info based on services and characteristics
          await this.updateDeviceInfo(device.id, service, characteristics);
        } catch (error) {
          console.error(`Error discovering characteristics for service ${service.uuid}:`, error);
        }
      }
    } catch (error) {
      console.error('Error discovering services:', error);
      throw error;
    }
  }

  /**
   * Set up notifications for relevant characteristics
   */
  private async setupNotifications(device: BluetoothDevice): Promise<void> {
    if (!device.gatt?.connected) {
      return;
    }

    try {
      // Clean up any existing notifications
      const existingCleanup = this.notificationCleanups.get(device.id);
      if (existingCleanup) {
        existingCleanup();
      }

      const cleanupFunctions: Array<() => void> = [];
      
      // Set up heart rate notifications if available
      try {
        const hrService = await device.gatt.getPrimaryService(GATT_SERVICES.HEART_RATE);
        const hrChar = await hrService.getCharacteristic(GATT_CHARACTERISTICS.HEART_RATE_MEASUREMENT);
        
        const hrHandler = (event: Event) => {
          const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
          if (!value) return;
          
          const data = processHeartRateData(DataViewWithHelpers.from(value.buffer));
          this.handleNotification(device.id, {
            timestamp: new Date(),
            deviceId: device.id,
            heartRate: data.heartRate,
            // Add more data as needed
          });
        };
        
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', hrHandler);
        
        cleanupFunctions.push(async () => {
          try {
            await hrChar.stopNotifications();
            hrChar.removeEventListener('characteristicvaluechanged', hrHandler);
          } catch (error) {
            console.error('Error cleaning up heart rate notifications:', error);
          }
        });
      } catch (error) {
        console.error('Error setting up heart rate notifications:', error);
      }

      // Add more notification setups for other services as needed
      
      // Store cleanup function
      this.notificationCleanups.set(device.id, () => {
        cleanupFunctions.forEach(cleanup => cleanup());
      });
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }

  /**
   * Update device information based on discovered services and characteristics
   */
  private async updateDeviceInfo(
    deviceId: string,
    service: BluetoothRemoteGATTService,
    characteristics: BluetoothCharacteristicProperties[]
  ): Promise<void> {
    const deviceInfo = this.deviceInfo.get(deviceId);
    if (!deviceInfo) return;

    const serviceUuid = service.uuid.toLowerCase();
    
    // Process device information service
    if (serviceUuid === GATT_SERVICES.DEVICE_INFORMATION.toLowerCase()) {
      for (const char of characteristics) {
        try {
          const value = await char.readValue();
          const charUuid = char.uuid.toLowerCase();
          
          // Process different device information characteristics
          if (charUuid === GATT_CHARACTERISTICS.MANUFACTURER_NAME.toLowerCase()) {
            deviceInfo.manufacturer = new TextDecoder().decode(value);
          } else if (charUuid === GATT_CHARACTERISTICS.MODEL_NUMBER.toLowerCase()) {
            deviceInfo.model = new TextDecoder().decode(value);
          } else if (charUuid === GATT_CHARACTERISTICS.FIRMWARE_REVISION.toLowerCase()) {
            deviceInfo.firmwareVersion = new TextDecoder().decode(value);
          } else if (charUuid === GATT_CHARACTERISTICS.HARDWARE_REVISION.toLowerCase()) {
            deviceInfo.hardwareVersion = new TextDecoder().decode(value);
          } else if (charUuid === GATT_CHARACTERISTICS.SOFTWARE_REVISION.toLowerCase()) {
            deviceInfo.softwareVersion = new TextDecoder().decode(value);
          }
        } catch (error) {
          console.error(`Error reading characteristic ${char.uuid}:`, error);
        }
      }
    }
    
    // Process other services as needed
  }

  /**
   * Handle incoming notifications
   */
  private handleNotification(deviceId: string, data: FitnessData): void {
    const callbacks = this.notificationCallbacks.get(deviceId);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Determine device type based on available services
   */
  private determineDeviceType(device: BluetoothDevice): WearableDevice['type'] {
    // This is a simplified implementation
    // In a real app, you'd check the device's services and characteristics
    
    if (device.name?.toLowerCase().includes('watch')) {
      return 'smartwatch';
    } else if (device.name?.toLowerCase().includes('band')) {
      return 'fitness_band';
    } else if (device.name?.toLowerCase().includes('scale')) {
      return 'smart_scale';
    } else if (device.name?.toLowerCase().includes('bike') || 
               device.name?.toLowerCase().includes('cycling')) {
      return 'cycling_sensor';
    } else if (device.name?.toLowerCase().includes('run') || 
               device.name?.toLowerCase().includes('pod')) {
      return 'running_pod';
    } else if (device.name?.toLowerCase().includes('hr') || 
               device.name?.toLowerCase().includes('heart')) {
      return 'heart_rate_monitor';
    }
    
    return 'fitness_band'; // Default
  }
}

// Export a singleton instance
export const bluetoothWearableService = BluetoothWearableService.getInstance();

export default bluetoothWearableService;
