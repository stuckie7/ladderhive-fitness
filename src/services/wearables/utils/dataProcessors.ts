
import { DataViewWithHelpers } from "./bufferUtils";
import { GATT_CHARACTERISTICS } from "../constants/gatt";

export interface HeartRateData {
  heartRate: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

export interface BatteryLevelData {
  batteryLevel: number;
  isLow: boolean;
}

export interface DeviceInfoData {
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  hardwareRevision?: string;
  firmwareRevision?: string;
  softwareRevision?: string;
  systemId?: string;
}

export interface CyclingSpeedData {
  wheelRevolutions?: number;
  lastWheelEventTime?: number;
  crankRevolutions?: number;
  lastCrankEventTime?: number;
  speed?: number; // m/s
  cadence?: number; // rpm
}

export interface RunningSpeedData {
  speed: number; // m/s
  cadence?: number; // steps/min
  strideLength?: number; // m
  totalDistance?: number; // m
}

/**
 * Process heart rate measurement data
 */
export function processHeartRateData(data: DataViewWithHelpers): HeartRateData {
  // First byte contains flags
  const flags = data.getUint8(0);
  
  // Heart rate value format flag
  const isUint16 = ((flags & 0x01) === 0x01);
  
  // Contact detection flags
  const hasContactDetection = ((flags & 0x04) === 0x04);
  const contactDetected = hasContactDetection ? ((flags & 0x02) === 0x02) : undefined;
  
  // Energy expended flag
  const hasEnergyExpended = ((flags & 0x08) === 0x08);
  
  // RR interval flag
  const hasRrInterval = ((flags & 0x10) === 0x10);
  
  // Get the heart rate value
  let heartRate: number;
  let offset = 1;
  
  if (isUint16) {
    heartRate = data.getUint16(offset, true);
    offset += 2;
  } else {
    heartRate = data.getUint8(offset);
    offset += 1;
  }
  
  // Get energy expended if present
  let energyExpended: number | undefined;
  if (hasEnergyExpended) {
    energyExpended = data.getUint16(offset, true);
    offset += 2;
  }
  
  // Get RR intervals if present
  const rrIntervals: number[] = [];
  if (hasRrInterval) {
    while (offset + 1 < data.byteLength) {
      const rrInterval = data.getUint16(offset, true) / 1024 * 1000; // Convert to ms
      rrIntervals.push(rrInterval);
      offset += 2;
    }
  }
  
  return {
    heartRate,
    contactDetected,
    energyExpended,
    rrIntervals: rrIntervals.length > 0 ? rrIntervals : undefined,
  };
}

/**
 * Process battery level data
 */
export function processBatteryLevel(data: DataViewWithHelpers): BatteryLevelData {
  const batteryLevel = data.getUint8(0);
  
  return {
    batteryLevel,
    isLow: batteryLevel < 20, // Consider less than 20% as low battery
  };
}

/**
 * Process device information data
 */
export function processDeviceInformation(
  characteristicUuid: string,
  data: DataViewWithHelpers
): Partial<DeviceInfoData> {
  const result: Partial<DeviceInfoData> = {};
  
  switch (characteristicUuid) {
    case GATT_CHARACTERISTICS.MANUFACTURER_NAME:
      result.manufacturer = data.toString();
      break;
    case GATT_CHARACTERISTICS.MODEL_NUMBER:
      result.model = data.toString();
      break;
    case GATT_CHARACTERISTICS.SERIAL_NUMBER:
      result.serialNumber = data.toString();
      break;
    case GATT_CHARACTERISTICS.HARDWARE_REVISION:
      result.hardwareRevision = data.toString();
      break;
    case GATT_CHARACTERISTICS.FIRMWARE_REVISION:
      result.firmwareRevision = data.toString();
      break;
    case GATT_CHARACTERISTICS.SOFTWARE_REVISION:
      result.softwareRevision = data.toString();
      break;
    default:
      if (characteristicUuid.toLowerCase().includes('2a50')) { // PNP_ID UUID
        // Process PNP ID data
        const vendorIdSource = data.getUint8(0);
        const vendorId = data.getUint16(1, true);
        const productId = data.getUint16(3, true);
        const productVersion = data.getUint16(5, true);
        
        result.systemId = JSON.stringify({
          vendorIdSource,
          vendorId,
          productId,
          productVersion
        });
      }
      break;
  }
  
  return result;
}

/**
 * Process cycling speed and cadence data
 */
export function processCyclingSpeedAndCadenceData(data: DataViewWithHelpers): CyclingSpeedData {
  // First byte contains flags
  const flags = data.getUint8(0);
  let offset = 1;
  
  const result: CyclingSpeedData = {};
  
  // Wheel revolution data present
  if ((flags & 0x01) === 0x01) {
    const wheelRevolutions = data.getUint32(offset, true);
    offset += 4;
    
    const lastWheelEventTime = data.getUint16(offset, true);
    offset += 2;
    
    // Store the data
    result.wheelRevolutions = wheelRevolutions;
    result.lastWheelEventTime = lastWheelEventTime;
    // Speed will be calculated when we have previous measurements
  }
  
  // Crank revolution data present
  if ((flags & 0x02) === 0x02) {
    const crankRevolutions = data.getUint16(offset, true);
    offset += 2;
    
    const lastCrankEventTime = data.getUint16(offset, true);
    offset += 2;
    
    // Store the data
    result.crankRevolutions = crankRevolutions;
    result.lastCrankEventTime = lastCrankEventTime;
    // Cadence will be calculated when we have previous measurements
  }
  
  return result;
}

/**
 * Process running speed and cadence data
 */
export function processRunningSpeedAndCadenceData(data: DataViewWithHelpers): RunningSpeedData {
  // First byte contains flags
  const flags = data.getUint8(0);
  let offset = 1;
  
  // Speed is always present
  const speed = data.getUint16(offset, true) / 100; // Convert to m/s
  offset += 2;
  
  // Initialize result
  const result: RunningSpeedData = {
    speed
  };
  
  // Cadence is present
  if ((flags & 0x01) === 0x01) {
    const cadence = data.getUint8(offset);
    offset += 1;
    result.cadence = cadence;
  }
  
  // Stride length is present
  if ((flags & 0x02) === 0x02) {
    const strideLength = data.getUint16(offset, true) / 100; // Convert to m
    offset += 2;
    result.strideLength = strideLength;
  }
  
  // Total distance is present
  if ((flags & 0x04) === 0x04) {
    const totalDistance = data.getUint32(offset, true) / 10; // Convert to m
    offset += 4;
    result.totalDistance = totalDistance;
  }
  
  return result;
}
