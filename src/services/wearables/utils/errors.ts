/**
 * Custom error classes for the Wearable Service
 */

export class WearableError extends Error {
  constructor(message: string, public code: string, public originalError?: unknown) {
    super(message);
    this.name = 'WearableError';
    
    // Maintain proper prototype chain
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    // Set the prototype explicitly (needed for instanceof checks)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DeviceNotFoundError extends WearableError {
  constructor(deviceId: string) {
    super(`Device not found: ${deviceId}`, 'DEVICE_NOT_FOUND');
    this.name = 'DeviceNotFoundError';
  }
}

export class DeviceNotConnectedError extends WearableError {
  constructor(deviceId: string) {
    super(`Device not connected: ${deviceId}`, 'DEVICE_NOT_CONNECTED');
    this.name = 'DeviceNotConnectedError';
  }
}

export class ConnectionError extends WearableError {
  constructor(deviceId: string, message: string) {
    super(`Connection error for device ${deviceId}: ${message}`, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}

export class ServiceNotFoundError extends WearableError {
  constructor(serviceUuid: string) {
    super(`Service not found: ${serviceUuid}`, 'SERVICE_NOT_FOUND');
    this.name = 'ServiceNotFoundError';
  }
}

export class CharacteristicNotFoundError extends WearableError {
  constructor(characteristicUuid: string) {
    super(`Characteristic not found: ${characteristicUuid}`, 'CHARACTERISTIC_NOT_FOUND');
    this.name = 'CharacteristicNotFoundError';
  }
}

export class OperationNotSupportedError extends WearableError {
  constructor(operation: string) {
    super(`Operation not supported: ${operation}`, 'OPERATION_NOT_SUPPORTED');
    this.name = 'OperationNotSupportedError';
  }
}

export class PermissionDeniedError extends WearableError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED');
    this.name = 'PermissionDeniedError';
  }
}

export class TimeoutError extends WearableError {
  constructor(operation: string) {
    super(`Operation timed out: ${operation}`, 'TIMEOUT');
    this.name = 'TimeoutError';
  }
}

export class DataProcessingError extends WearableError {
  constructor(message: string) {
    super(`Data processing error: ${message}`, 'DATA_PROCESSING_ERROR');
    this.name = 'DataProcessingError';
  }
}

/**
 * Helper function to create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  context: string = 'WearableService'
): { error: string; code: string; details?: any } {
  if (error instanceof WearableError) {
    return {
      error: error.message,
      code: error.code,
      details: error.originalError
        ? error.originalError instanceof Error
          ? { 
              name: error.originalError.name,
              message: error.originalError.message,
              stack: error.originalError.stack 
            }
          : error.originalError
        : undefined
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'UNKNOWN_ERROR',
      details: {
        name: error.name,
        stack: error.stack
      }
    };
  }

  return {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Error codes for reference
 */
export const ERROR_CODES = {
  // Device related
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_NOT_CONNECTED: 'DEVICE_NOT_CONNECTED',
  DEVICE_ALREADY_CONNECTED: 'DEVICE_ALREADY_CONNECTED',
  DEVICE_DISCONNECTED: 'DEVICE_DISCONNECTED',
  
  // Connection related
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  DISCONNECTION_ERROR: 'DISCONNECTION_ERROR',
  
  // Service related
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  CHARACTERISTIC_NOT_FOUND: 'CHARACTERISTIC_NOT_FOUND',
  DESCRIPTOR_NOT_FOUND: 'DESCRIPTOR_NOT_FOUND',
  
  // Permission related
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  BLUETOOTH_NOT_SUPPORTED: 'BLUETOOTH_NOT_SUPPORTED',
  BLUETOOTH_NOT_AVAILABLE: 'BLUETOOTH_NOT_AVAILABLE',
  
  // Data related
  DATA_PROCESSING_ERROR: 'DATA_PROCESSING_ERROR',
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  
  // Operation related
  OPERATION_NOT_SUPPORTED: 'OPERATION_NOT_SUPPORTED',
  OPERATION_FAILED: 'OPERATION_FAILED',
  OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  TIMEOUT: 'TIMEOUT'
} as const;
