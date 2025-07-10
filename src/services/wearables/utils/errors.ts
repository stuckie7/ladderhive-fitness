
export class WebBluetoothApiNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebBluetoothApiNotAvailableError';
  }
}

export class BluetoothConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BluetoothConnectionError';
  }
}

export class BluetoothDeviceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BluetoothDeviceNotFoundError';
  }
}
