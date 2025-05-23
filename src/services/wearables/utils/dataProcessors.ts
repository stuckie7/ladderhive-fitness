import { DataView } from './bufferUtils';
import { GATT_SERVICES, GATT_CHARACTERISTICS } from '../constants/gatt';
import { DataProcessingError } from './errors';

/**
 * Processes heart rate measurement data according to the Bluetooth GATT specification
 * @param data DataView containing the heart rate measurement
 * @returns Object containing the processed heart rate data
 */
export function processHeartRateData(data: DataView): {
  heartRate: number;
  contactDetected: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
} {
  try {
    let offset = 0;
    const flags = data.getUint8(offset++);
    
    // Check if the heart rate value is 8-bit or 16-bit
    const is16Bit = (flags & 0x01) !== 0;
    
    // Get heart rate value
    let heartRate: number;
    if (is16Bit) {
      heartRate = data.getUint16(offset, true);
      offset += 2;
    } else {
      heartRate = data.getUint8(offset++);
    }
    
    // Check if contact is detected
    const contactDetected = (flags & 0x06) !== 0;
    
    // Check if energy expended is present
    const hasEnergyExpended = (flags & 0x08) !== 0;
    let energyExpended: number | undefined;
    
    if (hasEnergyExpended) {
      energyExpended = data.getUint16(offset, true);
      offset += 2;
    }
    
    // Check if RR-intervals are present
    const hasRRIntervals = (flags & 0x10) !== 0;
    const rrIntervals: number[] = [];
    
    if (hasRRIntervals) {
      // Each RR-interval is 2 bytes
      while (offset + 1 < data.byteLength) {
        rrIntervals.push(data.getUint16(offset, true) / 1024); // Convert to seconds
        offset += 2;
      }
    }
    
    return {
      heartRate,
      contactDetected,
      energyExpended,
      rrIntervals: rrIntervals.length > 0 ? rrIntervals : undefined
    };
  } catch (error) {
    throw new DataProcessingError(
      `Failed to process heart rate data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Processes battery level data
 * @param data DataView containing the battery level
 * @returns Battery level as a percentage (0-100)
 */
export function processBatteryLevel(data: DataView): number {
  try {
    if (data.byteLength < 1) {
      throw new Error('Invalid battery level data: empty');
    }
    
    const level = data.getUint8(0);
    
    // Ensure the battery level is within valid range (0-100%)
    if (level < 0 || level > 100) {
      throw new Error(`Invalid battery level: ${level}%`);
    }
    
    return level;
  } catch (error) {
    throw new DataProcessingError(
      `Failed to process battery level: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Processes device information data
 * @param data DataView containing the device information
 * @param characteristicUuid UUID of the characteristic being processed
 * @returns Processed device information
 */
export function processDeviceInformation(
  data: DataView,
  characteristicUuid: string
): string | number | Record<string, unknown> {
  try {
    switch (characteristicUuid.toLowerCase()) {
      case GATT_CHARACTERISTICS.MANUFACTURER_NAME.toLowerCase():
        return decodeStringValue(data);
        
      case GATT_CHARACTERISTICS.MODEL_NUMBER.toLowerCase():
      case GATT_CHARACTERISTICS.SERIAL_NUMBER.toLowerCase():
      case GATT_CHARACTERISTICS.HARDWARE_REVISION.toLowerCase():
      case GATT_CHARACTERISTICS.FIRMWARE_REVISION.toLowerCase():
      case GATT_CHARACTERISTICS.SOFTWARE_REVISION.toLowerCase():
        return decodeStringValue(data);
        
      case GATT_CHARACTERISTICS.PNP_ID.toLowerCase():
        return {
          vendorIdSource: data.getUint8(0),
          vendorId: data.getUint16(1, true),
          productId: data.getUint16(3, true),
          productVersion: data.getUint16(5, true)
        };
        
      default:
        return Array.from(new Uint8Array(data.buffer));
    }
  } catch (error) {
    throw new DataProcessingError(
      `Failed to process device information (${characteristicUuid}): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Processes cycling speed and cadence data
 * @param data DataView containing the CSC data
 * @returns Processed CSC data
 */
export function processCyclingSpeedAndCadenceData(data: DataView): {
  cumulativeWheelRevolutions: number;
  lastWheelEventTime: number;
  cumulativeCrankRevolutions?: number;
  lastCrankEventTime?: number;
  speed?: number; // m/s
  cadence?: number; // RPM
} {
  try {
    let offset = 0;
    const flags = data.getUint8(offset++);
    
    // Wheel revolution data present
    const hasWheelRevData = (flags & 0x01) !== 0;
    
    // Crank revolution data present
    const hasCrankRevData = (flags & 0x02) !== 0;
    
    let cumulativeWheelRevolutions = 0;
    let lastWheelEventTime = 0;
    let cumulativeCrankRevolutions: number | undefined;
    let lastCrankEventTime: number | undefined;
    
    if (hasWheelRevData) {
      // Cumulative Wheel Revolutions (uint32)
      cumulativeWheelRevolutions = data.getUint32(offset, true);
      offset += 4;
      
      // Last Wheel Event Time (uint16, 1/1024 seconds)
      lastWheelEventTime = data.getUint16(offset, true);
      offset += 2;
    }
    
    if (hasCrankRevData) {
      // Cumulative Crank Revolutions (uint16)
      cumulativeCrankRevolutions = data.getUint16(offset, true);
      offset += 2;
      
      // Last Crank Event Time (uint16, 1/1024 seconds)
      lastCrankEventTime = data.getUint16(offset, true);
      offset += 2;
    }
    
    // Calculate speed and cadence if we have the necessary data
    let speed: number | undefined;
    let cadence: number | undefined;
    
    // Note: To calculate actual speed, you'd need to know the wheel circumference
    // This is a simplified example assuming a standard wheel size
    const WHEEL_CIRCUMFERENCE = 2.1; // meters (example for 700c wheel)
    
    if (hasWheelRevData && lastWheelEventTime > 0) {
      // Speed in m/s = (wheel circumference * revolutions) / time
      // For a typical bike computer, you'd track the time between updates
      // This is a simplified calculation
      speed = (WHEEL_CIRCUMFERENCE * cumulativeWheelRevolutions) / (lastWheelEventTime / 1024);
    }
    
    if (hasCrankRevData && lastCrankEventTime !== undefined && lastCrankEventTime > 0) {
      // Cadence in RPM = (revolutions / time in minutes)
      // This is a simplified calculation
      cadence = (cumulativeCrankRevolutions! / (lastCrankEventTime / 1024)) * 60;
    }
    
    return {
      cumulativeWheelRevolutions,
      lastWheelEventTime,
      cumulativeCrankRevolutions,
      lastCrankEventTime,
      speed,
      cadence
    };
  } catch (error) {
    throw new DataProcessingError(
      `Failed to process cycling speed and cadence data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Processes running speed and cadence data
 * @param data DataView containing the RSC data
 * @returns Processed RSC data
 */
export function processRunningSpeedAndCadenceData(data: DataView): {
  instantaneousSpeed: number; // m/s
  averageSpeed?: number; // m/s
  totalDistance?: number; // meters
  strideLength?: number; // meters
  instantaneousCadence: number; // steps/minute
  averageCadence?: number; // steps/minute
  stepCount?: number;
} {
  try {
    let offset = 0;
    const flags = data.getUint8(offset++);
    
    // Instantaneous speed (uint16, 1/256 m/s)
    const instantaneousSpeed = data.getUint16(offset, true) / 256;
    offset += 2;
    
    // Instantaneous cadence (uint8, 1/2 steps/minute)
    const instantaneousCadence = data.getUint8(offset++) / 2;
    
    // Optional fields
    let averageSpeed: number | undefined;
    let totalDistance: number | undefined;
    let strideLength: number | undefined;
    let averageCadence: number | undefined;
    let stepCount: number | undefined;
    
    // Check which optional fields are present
    if (flags & 0x01) { // Average Speed present
      averageSpeed = data.getUint16(offset, true) / 256;
      offset += 2;
    }
    
    if (flags & 0x02) { // Total Distance present
      totalDistance = data.getUint32(offset, true) / 10; // decimeters to meters
      offset += 4;
    }
    
    if (flags & 0x04) { // Stride Length present
      strideLength = data.getUint16(offset, true) / 100; // cm to meters
      offset += 2;
    }
    
    if (flags & 0x08) { // Average Cadence present
      averageCadence = data.getUint8(offset++) / 2;
    }
    
    if (flags & 0x10) { // Step Count present
      stepCount = data.getUint16(offset, true);
    }
    
    return {
      instantaneousSpeed,
      averageSpeed,
      totalDistance,
      strideLength,
      instantaneousCadence,
      averageCadence,
      stepCount
    };
  } catch (error) {
    throw new DataProcessingError(
      `Failed to process running speed and cadence data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Helper function to decode string values from DataView
 */
function decodeStringValue(data: DataView): string {
  try {
    // Convert the buffer to a Uint8Array and then to a string
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/, '');
  } catch (error) {
    throw new DataProcessingError(
      `Failed to decode string value: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Helper function to convert a UUID to a standard format (lowercase, no dashes)
 */
export function normalizeUuid(uuid: string): string {
  if (!uuid) return '';
  
  // Remove any dashes and convert to lowercase
  return uuid.toLowerCase().replace(/[\-{}]/g, '');
}

/**
 * Helper function to check if a UUID matches a known UUID, handling short and long forms
 */
export function isUuidMatch(uuid1: string, uuid2: string): boolean {
  if (!uuid1 || !uuid2) return false;
  
  // Normalize both UUIDs
  const norm1 = normalizeUuid(uuid1);
  const norm2 = normalizeUuid(uuid2);
  
  // Handle short UUIDs (16-bit or 32-bit)
  if (norm1.length === 4 || norm1.length === 8) {
    // Compare against the last 4 or 8 characters of the full UUID
    return norm2.endsWith(norm1);
  }
  
  if (norm2.length === 4 || norm2.length === 8) {
    // Compare against the last 4 or 8 characters of the full UUID
    return norm1.endsWith(norm2);
  }
  
  // Full UUID comparison
  return norm1 === norm2;
}
