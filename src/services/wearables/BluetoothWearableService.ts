import { WearableDevice, WearableService } from './WearableService';

class BluetoothWearableService implements WearableService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onHeartRateChange: ((heartRate: number) => void) | null = null;
  private onBatteryLevelChange: ((batteryLevel: number) => void) | null = null;
  private isConnected: boolean = false;

  constructor() {
    if (!navigator.bluetooth) {
      console.error('Bluetooth API is not available in this browser or environment');
    }
  }

  isAvailable(): boolean {
    return !!navigator.bluetooth;
  }

  isDeviceConnected(): boolean {
    return this.isConnected && !!this.device && !!this.server && this.server.connected;
  }

  setHeartRateCallback(callback: (heartRate: number) => void): void {
    this.onHeartRateChange = callback;
  }

  setBatteryLevelCallback(callback: (batteryLevel: number) => void): void {
    this.onBatteryLevelChange = callback;
  }

  private handleHeartRateNotification(event: Event): void {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;

    // Heart Rate Measurement parsing based on Bluetooth GATT specification
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRate: number;
    
    if (rate16Bits) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }

    if (this.onHeartRateChange) {
      this.onHeartRateChange(heartRate);
    }
  }

  private handleBatteryLevelNotification(event: Event): void {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;

    const batteryLevel = value.getUint8(0);
    
    if (this.onBatteryLevelChange) {
      this.onBatteryLevelChange(batteryLevel);
    }
  }

  async connect(): Promise<WearableDevice> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }], // Use string instead of BluetoothServiceUUID
        optionalServices: ['battery_service', 'device_information']
      });

      this.device = device;
      
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        console.log('Device disconnected');
      });

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }
      this.server = server;

      // Connect to Heart Rate Service
      const heartRateService = await server.getPrimaryService('heart_rate');
      this.heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
      
      // Start notifications for heart rate
      await this.heartRateCharacteristic.startNotifications();
      this.heartRateCharacteristic.addEventListener('characteristicvaluechanged', 
        this.handleHeartRateNotification.bind(this));

      // Try to connect to Battery Service if available
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        this.batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        
        // Start notifications for battery level
        await this.batteryCharacteristic.startNotifications();
        this.batteryCharacteristic.addEventListener('characteristicvaluechanged', 
          this.handleBatteryLevelNotification.bind(this));
      } catch (error) {
        console.log('Battery service not available on this device');
      }

      // Get device information if available
      let deviceInfo: any = {};
      try {
        const deviceInfoService = await server.getPrimaryService('device_information');
        
        // Try to read each characteristic, but don't fail if some are not available
        try {
          const manufacturerChar = await deviceInfoService.getCharacteristic('manufacturer_name_string');
          const manufacturerValue = await manufacturerChar.readValue();
          deviceInfo.manufacturer = new TextDecoder().decode(manufacturerValue);
        } catch (e) {}
        
        try {
          const modelChar = await deviceInfoService.getCharacteristic('model_number_string');
          const modelValue = await modelChar.readValue();
          deviceInfo.model = new TextDecoder().decode(modelValue);
        } catch (e) {}
        
        try {
          const serialChar = await deviceInfoService.getCharacteristic('serial_number_string');
          const serialValue = await serialChar.readValue();
          deviceInfo.serialNumber = new TextDecoder().decode(serialValue);
        } catch (e) {}
        
        try {
          const firmwareChar = await deviceInfoService.getCharacteristic('firmware_revision_string');
          const firmwareValue = await firmwareChar.readValue();
          deviceInfo.firmwareRevision = new TextDecoder().decode(firmwareValue);
        } catch (e) {}
        
      } catch (error) {
        console.log('Device information service not available');
      }

      this.isConnected = true;
      
      return {
        id: device.id || 'unknown',
        name: device.name || 'Bluetooth Heart Rate Monitor',
        type: 'bluetooth',
        connected: true,
        batteryLevel: null, // Will be updated via notifications
        manufacturer: deviceInfo.manufacturer || 'Unknown',
        model: deviceInfo.model || 'Unknown',
        firmwareVersion: deviceInfo.firmwareRevision || 'Unknown',
      };
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.heartRateCharacteristic) {
      try {
        await this.heartRateCharacteristic.stopNotifications();
        this.heartRateCharacteristic.removeEventListener('characteristicvaluechanged', 
          this.handleHeartRateNotification.bind(this));
      } catch (e) {
        console.error('Error stopping heart rate notifications:', e);
      }
    }
    
    if (this.batteryCharacteristic) {
      try {
        await this.batteryCharacteristic.stopNotifications();
        this.batteryCharacteristic.removeEventListener('characteristicvaluechanged', 
          this.handleBatteryLevelNotification.bind(this));
      } catch (e) {
        console.error('Error stopping battery notifications:', e);
      }
    }
    
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }
    
    this.device = null;
    this.server = null;
    this.heartRateCharacteristic = null;
    this.batteryCharacteristic = null;
    this.isConnected = false;
  }

  async getConnectedDevices(): Promise<WearableDevice[]> {
    if (this.isDeviceConnected() && this.device) {
      return [{
        id: this.device.id || 'unknown',
        name: this.device.name || 'Bluetooth Heart Rate Monitor',
        type: 'bluetooth',
        connected: true,
        batteryLevel: null, // Would need to read the current value
        manufacturer: 'Unknown', // Would need to read from device info
        model: 'Unknown',
        firmwareVersion: 'Unknown',
      }];
    }
    return [];
  }
}

// Create and export a singleton instance
export const bluetoothWearableService = new BluetoothWearableService();

export default BluetoothWearableService;
