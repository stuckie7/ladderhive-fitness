import { 
  WearableDevice, 
  WearableDeviceType, 
  WearableConnectionState,
  WearableDataType,
  WearableMeasurement,
  BluetoothDeviceFilter
} from '@/types/wearable';
import { GATT_SERVICES, GATT_CHARACTERISTICS } from './constants/gatt';
import { DataViewWithHelpers } from './utils/bufferUtils';
import { 
  processHeartRateData, 
  processBatteryLevel,
  processDeviceInformation,
  processCyclingSpeedAndCadenceData,
  processRunningSpeedAndCadenceData
} from './utils/dataProcessors';
import { WebBluetoothApiNotAvailableError } from './utils/errors';

interface BluetoothRequestDeviceFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
}

/**
 * Service for interacting with Bluetooth Low Energy (BLE) wearable devices.
 * This service abstracts the Web Bluetooth API to provide a simplified interface
 * for connecting to, reading data from, and managing wearable devices.
 */
export class BluetoothWearableService {
  private deviceFilters: BluetoothDeviceFilter[] = [];
  private deviceRecords: {
    id?: string;
    connected?: boolean;
    name?: string;
    type?: WearableDeviceType;
    lastSync?: Date;
    manufacturer?: string;
    model?: string;
    firmwareVersion?: string;
    hardwareVersion?: string;
    serialNumber?: string;
    batteryLevel?: number;
    heartRate?: number;
    cadence?: number;
    speed?: number;
    distance?: number;
    maxHeartRate?: number;
  }[] = [];
  
  /**
   * Constructor for the BluetoothWearableService.
   * @param deviceFilters An array of filters to use when scanning for devices.
   */
  constructor(deviceFilters: BluetoothDeviceFilter[] = []) {
    this.deviceFilters = deviceFilters;
  }
  
  /**
   * Checks if the Web Bluetooth API is available in the current environment.
   * @returns A promise that resolves with a boolean indicating availability.
   */
  public async isBluetoothAvailable(): Promise<boolean> {
    try {
      return !!navigator.bluetooth;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Requests a Bluetooth device from the user, prompting them to select a device
   * from a list of available devices that match the service's device filters.
   * @returns A promise that resolves with a WearableDevice object representing
   *          the selected device, or null if no device was selected.
   * @throws {WebBluetoothApiNotAvailableError} If the Web Bluetooth API is not available.
   */
  public async requestDevice(): Promise<WearableDevice | null> {
    if (!navigator.bluetooth) {
      throw new WebBluetoothApiNotAvailableError('Web Bluetooth API not available.');
    }
    
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: this.getRequestFilters(),
        optionalServices: Object.values(GATT_SERVICES)
      });
      
      if (!device) {
        return null;
      }
      
      return await this.connectToDevice(device);
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      return null;
    }
  }
  
  private connectToDevice(device: BluetoothDevice): Promise<WearableDevice> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!device.gatt) {
          reject('GATT Server not available on device.');
          return;
        }
        
        const server = await device.gatt.connect();
        
        // Read device information
        await this.readDeviceInformation(device);
        
        // Setup heart rate measurement
        await this.setupHeartRateMeasurement(device);
        
        // Get all services
        const services = await server.getPrimaryServices();
        
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          await this.readAllCharacteristics(characteristics, service);
        }
        
        // Add to connected devices
        const deviceRecord = {
          id: device.id,
          connected: true,
          name: device.name,
          type: 'bluetooth',
          lastSync: new Date(),
          manufacturer: this.deviceRecords.find(d => d.id === device.id)?.manufacturer,
          model: this.deviceRecords.find(d => d.id === device.id)?.model,
          firmwareVersion: this.deviceRecords.find(d => d.id === device.id)?.firmwareVersion,
          hardwareVersion: this.deviceRecords.find(d => d.id === device.id)?.hardwareVersion,
          serialNumber: this.deviceRecords.find(d => d.id === device.id)?.serialNumber,
          batteryLevel: this.deviceRecords.find(d => d.id === device.id)?.batteryLevel,
          heartRate: this.deviceRecords.find(d => d.id === device.id)?.heartRate,
          cadence: this.deviceRecords.find(d => d.id === device.id)?.cadence,
          speed: this.deviceRecords.find(d => d.id === device.id)?.speed,
          distance: this.deviceRecords.find(d => d.id === device.id)?.distance,
          maxHeartRate: this.deviceRecords.find(d => d.id === device.id)?.maxHeartRate
        };
        
        this.deviceRecords.push(deviceRecord);
        
        // Setup disconnect handler
        device.addEventListener('gattserverdisconnected', () => this.onDeviceDisconnected(device));
        
        // Resolve with the new device
        resolve({
          id: device.id,
          connected: true,
          name: device.name,
          type: 'bluetooth',
          lastSync: new Date(),
          manufacturer: this.deviceRecords.find(d => d.id === device.id)?.manufacturer,
          model: this.deviceRecords.find(d => d.id === device.id)?.model,
          firmwareVersion: this.deviceRecords.find(d => d.id === device.id)?.firmwareVersion,
          hardwareVersion: this.deviceRecords.find(d => d.id === device.id)?.hardwareVersion,
          serialNumber: this.deviceRecords.find(d => d.id === device.id)?.serialNumber,
          batteryLevel: this.deviceRecords.find(d => d.id === device.id)?.batteryLevel,
          heartRate: this.deviceRecords.find(d => d.id === device.id)?.heartRate,
          cadence: this.deviceRecords.find(d => d.id === device.id)?.cadence,
          speed: this.deviceRecords.find(d => d.id === device.id)?.speed,
          distance: this.deviceRecords.find(d => d.id === device.id)?.distance,
          maxHeartRate: this.deviceRecords.find(d => d.id === device.id)?.maxHeartRate
        });
      } catch (error) {
        console.error('Error connecting to Bluetooth device:', error);
        reject(error);
      }
    });
  }
  
  private getRequestFilters(): BluetoothRequestDeviceFilter[] {
    // Convert our custom filter type to the Web Bluetooth API filter type
    return this.deviceFilters.map(filter => {
      return {
        services: filter.services,
        name: filter.name,
        namePrefix: filter.namePrefix
      } as BluetoothRequestDeviceFilter;
    });
  }
  
  /**
   * Gets the connection state of a specific device.
   * @param deviceId The unique identifier of the device.
   * @returns A promise that resolves with a WearableConnectionState indicating
   *          the current connection state of the device.
   */
  public async getDeviceConnectionState(deviceId: string): Promise<WearableConnectionState> {
    const device = this.deviceRecords.find(device => device.id === deviceId);
    return device ? (device.connected ? 'connected' : 'disconnected') : 'disconnected';
  }
  
  /**
   * Gets a list of all devices that are currently connected to the service.
   * @returns An array of WearableDevice objects representing the connected devices.
   */
  public getConnectedDevices(): WearableDevice[] {
    // Map our internal device records to the WearableDevice type
    return this.deviceRecords.map(record => {
      // Ensure all required properties are present
      return {
        id: record.id || 'unknown',
        connected: record.connected || false,
        name: record.name || 'Unknown Device',
        type: record.type || 'unknown',
        lastSync: record.lastSync,
        manufacturer: record.manufacturer,
        model: record.model,
        firmwareVersion: record.firmwareVersion,
        hardwareVersion: record.hardwareVersion,
        serialNumber: record.serialNumber,
        batteryLevel: record.batteryLevel,
        heartRate: record.heartRate,
        cadence: record.cadence,
        speed: record.speed,
        distance: record.distance,
        maxHeartRate: record.maxHeartRate
      } as WearableDevice;
    });
  }
  
  /**
   * Disconnects from a specific device.
   * @param deviceId The unique identifier of the device to disconnect from.
   * @returns A promise that resolves when the device has been disconnected.
   */
  public async disconnectDevice(deviceId: string): Promise<void> {
    const deviceRecord = this.deviceRecords.find(device => device.id === deviceId);
    
    if (deviceRecord && deviceRecord.connected && navigator.bluetooth) {
      try {
        const device = await navigator.bluetooth.getDevices().then(devices =>
          devices.find(device => device.id === deviceId)
        );
        
        if (device && device.gatt) {
          device.gatt.disconnect();
        }
      } catch (error) {
        console.error('Error disconnecting from Bluetooth device:', error);
      }
    }
  }
  
  private async onDeviceDisconnected(device: BluetoothDevice): Promise<void> {
    const deviceRecordIndex = this.deviceRecords.findIndex(record => record.id === device.id);
    
    if (deviceRecordIndex !== -1) {
      this.deviceRecords[deviceRecordIndex].connected = false;
    }
    
    console.log(`Device ${device.id} disconnected.`);
  }
  
  private async readDeviceInformation(device: BluetoothDevice): Promise<void> {
    if (!device.gatt) {
      console.error('GATT Server not available on device.');
      return;
    }
    
    try {
      const server = device.gatt;
      
      // Get Device Information service
      const service = await server.getPrimaryService(GATT_SERVICES.DEVICE_INFORMATION);
      
      // Get characteristics
      const manufacturerCharacteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.MANUFACTURER_NAME);
      const modelNumberCharacteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.MODEL_NUMBER);
      const serialNumberCharacteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.SERIAL_NUMBER);
      const hardwareRevisionCharacteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.HARDWARE_REVISION);
      const firmwareRevisionCharacteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.FIRMWARE_REVISION);
      const softwareRevisionCharacteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.SOFTWARE_REVISION);
      
      // Read characteristic values
      const manufacturerValue = await manufacturerCharacteristic.readValue();
      const modelNumberValue = await modelNumberCharacteristic.readValue();
      const serialNumberValue = await serialNumberCharacteristic.readValue();
      const hardwareRevisionValue = await hardwareRevisionCharacteristic.readValue();
      const firmwareRevisionValue = await firmwareRevisionCharacteristic.readValue();
      const softwareRevisionValue = await softwareRevisionCharacteristic.readValue();
      
      // Update device record
      const deviceRecordIndex = this.deviceRecords.findIndex(record => record.id === device.id);
      
      if (deviceRecordIndex !== -1) {
        this.deviceRecords[deviceRecordIndex].manufacturer = manufacturerValue.toString();
        this.deviceRecords[deviceRecordIndex].model = modelNumberValue.toString();
        this.deviceRecords[deviceRecordIndex].serialNumber = serialNumberValue.toString();
        this.deviceRecords[deviceRecordIndex].hardwareVersion = hardwareRevisionValue.toString();
        this.deviceRecords[deviceRecordIndex].firmwareVersion = firmwareRevisionValue.toString();
        this.deviceRecords[deviceRecordIndex].softwareVersion = softwareRevisionValue.toString();
      } else {
        this.deviceRecords.push({
          id: device.id,
          connected: true,
          name: device.name,
          type: 'bluetooth',
          lastSync: new Date(),
          manufacturer: manufacturerValue.toString(),
          model: modelNumberValue.toString(),
          serialNumber: serialNumberValue.toString(),
          hardwareVersion: hardwareRevisionValue.toString(),
          firmwareVersion: firmwareRevisionValue.toString(),
          softwareVersion: softwareRevisionValue.toString(),
        });
      }
    } catch (error) {
      console.error('Error reading device information:', error);
    }
  }
  
  private async setupHeartRateMeasurement(device: BluetoothDevice): Promise<void> {
    if (!device.gatt) {
      console.error('GATT Server not available on device.');
      return;
    }
    
    try {
      const server = device.gatt;
      
      // Get Heart Rate service
      const service = await server.getPrimaryService(GATT_SERVICES.HEART_RATE);
      
      // Get Heart Rate Measurement characteristic
      const characteristic = await service.getCharacteristic(GATT_CHARACTERISTICS.HEART_RATE_MEASUREMENT);
      
      // Start notifications
      await characteristic.startNotifications();
      
      // Add event listener for characteristic value changes
      characteristic.addEventListener('characteristicvaluechanged', (event) => this.onHeartRateChanged(event));
    } catch (error) {
      console.error('Error setting up heart rate measurement:', error);
    }
  }
  
  private handleCharacteristicChanged(characteristics: BluetoothRemoteGATTCharacteristic[], event: Event): void {
  try {
    // Need to cast the event target to the correct type
    const characteristic = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    
    // Find the device record
    const deviceRecordIndex = this.deviceRecords.findIndex(record => record.id === characteristic.service.device.id);
    
    if (deviceRecordIndex === -1) {
      console.warn(`Device record not found for device ID: ${characteristic.service.device.id}`);
      return;
    }
    
    // Process the characteristic value
    this.processCharacteristicValue(characteristic.uuid, characteristic.value as DataView, false);
  } catch (error) {
    console.error('Error handling characteristic change:', error);
  }
}
  
  private onHeartRateChanged(event: Event): void {
  try {
    // Need to cast the event target to the correct type
    const characteristic = event.target as unknown as BluetoothRemoteGATTCharacteristic;
    
    const dataView = characteristic.value;
    if (!dataView) {
      console.warn('Heart Rate Measurement characteristic value is null.');
      return;
    }
    
    const data = new DataViewWithHelpers(dataView.buffer);
    const heartRateData = processHeartRateData(data);
    
    // Find the device record
    const deviceRecordIndex = this.deviceRecords.findIndex(record => record.id === characteristic.service.device.id);
    
    if (deviceRecordIndex === -1) {
      console.warn(`Device record not found for device ID: ${characteristic.service.device.id}`);
      return;
    }
    
    // Update the heart rate in the device record
    this.deviceRecords[deviceRecordIndex].heartRate = heartRateData.heartRate;
  } catch (error) {
    console.error('Error processing heart rate data:', error);
  }
}
  
  private async readAllCharacteristics(characteristics: BluetoothRemoteGATTCharacteristic[], service: BluetoothRemoteGATTService): Promise<void> {
  for (const characteristic of characteristics) {
    try {
      // Only attempt to read if the characteristic has the 'read' property
      if (characteristic.properties.read) {
        const value = await characteristic.readValue();
        this.processCharacteristicValue(characteristic.uuid, value, true);
      }
    } catch (error) {
      console.error(`Error reading characteristic ${characteristic.uuid}:`, error);
    }
  }
}
  
  private processCharacteristicValue(characteristicId: string, value: DataView, isRead: boolean = false): void {
    const data = new DataViewWithHelpers(value.buffer);
    
    switch (characteristicId) {
      case GATT_CHARACTERISTICS.BATTERY_LEVEL:
        const batteryLevelData = processBatteryLevel(data);
        console.log(`Battery Level: ${batteryLevelData.batteryLevel}%`);
        break;
      default:
        const deviceInfo = processDeviceInformation(characteristicId, data);
        if (deviceInfo.manufacturer) {
          console.log(`Manufacturer Name: ${deviceInfo.manufacturer}`);
        }
        if (deviceInfo.model) {
          console.log(`Model Number: ${deviceInfo.model}`);
        }
        break;
    }
  }
}
