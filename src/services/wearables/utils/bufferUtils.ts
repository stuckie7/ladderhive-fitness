/**
 * Custom DataView implementation with additional helper methods
 * for working with Bluetooth GATT characteristic values
 */
export class DataViewWithHelpers extends DataView {
  /**
   * Reads a string from the buffer with the specified encoding
   * @param offset Offset in bytes from the start of the buffer
   * @param length Length of the string in bytes
   * @param encoding String encoding (default: 'utf-8')
   */
  getString(offset: number, length: number, encoding: BufferEncoding = 'utf-8'): string {
    const bytes = new Uint8Array(this.buffer, this.byteOffset + offset, length);
    return Buffer.from(bytes).toString(encoding).replace(/\0+$/, '');
  }

  /**
   * Reads a 24-bit unsigned integer
   */
  getUint24(offset: number, littleEndian?: boolean): number {
    return this.getUint8(offset) | 
           (this.getUint8(offset + 1) << 8) | 
           (this.getUint8(offset + 2) << 16);
  }

  /**
   * Reads a 40-bit unsigned integer (5 bytes)
   */
  getUint40(offset: number, littleEndian?: boolean): number {
    return this.getUint32(offset, littleEndian) + 
           (this.getUint8(offset + 4) * 0x100000000);
  }

  /**
   * Reads a 48-bit unsigned integer (6 bytes)
   */
  getUint48(offset: number, littleEndian?: boolean): number {
    return this.getUint32(offset, littleEndian) + 
           (this.getUint16(offset + 4, littleEndian) * 0x100000000);
  }

  /**
   * Reads a signed 8.8 fixed-point number
   */
  getFixed8_8(offset: number): number {
    const intPart = this.getInt8(offset);
    const fracPart = this.getUint8(offset + 1) / 256;
    return intPart + fracPart;
  }

  /**
   * Reads an unsigned 8.8 fixed-point number
   */
  getUFixed8_8(offset: number): number {
    const intPart = this.getUint8(offset);
    const fracPart = this.getUint8(offset + 1) / 256;
    return intPart + fracPart;
  }

  /**
   * Reads a signed 16.16 fixed-point number
   */
  getFixed16_16(offset: number, littleEndian?: boolean): number {
    const intPart = this.getInt16(offset, littleEndian);
    const fracPart = this.getUint16(offset + 2, littleEndian) / 0x10000;
    return intPart + fracPart;
  }

  /**
   * Reads an IEEE 754 32-bit floating-point number
   */
  getFloat32(offset: number, littleEndian?: boolean): number {
    return new DataView(this.buffer, this.byteOffset + offset, 4).getFloat32(0, littleEndian);
  }

  /**
   * Reads an IEEE 754 64-bit floating-point number
   */
  getFloat64(offset: number, littleEndian?: boolean): number {
    return new DataView(this.buffer, this.byteOffset + offset, 8).getFloat64(0, littleEndian);
  }

  /**
   * Creates a new DataViewWithHelpers from an ArrayBuffer or ArrayBufferView
   */
  static from(buffer: ArrayBuffer | ArrayBufferView): DataViewWithHelpers {
    if (buffer instanceof ArrayBuffer) {
      return new DataViewWithHelpers(buffer);
    }
    return new DataViewWithHelpers(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
  }
}

/**
 * Helper function to convert a hex string to an ArrayBuffer
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
  const length = cleanHex.length;
  
  if (length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters');
  }
  
  const buffer = new ArrayBuffer(length / 2);
  const view = new Uint8Array(buffer);
  
  for (let i = 0; i < length; i += 2) {
    view[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  
  return buffer;
}

/**
 * Helper function to convert an ArrayBuffer to a hex string
 */
export function arrayBufferToHex(buffer: ArrayBuffer | ArrayBufferView): string {
  const array = buffer instanceof ArrayBuffer 
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Helper function to concatenate multiple ArrayBuffers
 */
export function concatArrayBuffers(...buffers: (ArrayBuffer | ArrayBufferView)[]): ArrayBuffer {
  // Calculate total length
  let totalLength = 0;
  for (const buffer of buffers) {
    totalLength += buffer.byteLength;
  }
  
  // Create result buffer
  const result = new Uint8Array(totalLength);
  
  // Copy data
  let offset = 0;
  for (const buffer of buffers) {
    const bytes = buffer instanceof ArrayBuffer 
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    
    result.set(bytes, offset);
    offset += bytes.length;
  }
  
  return result.buffer;
}

/**
 * Helper function to convert a string to an ArrayBuffer
 */
export function stringToArrayBuffer(str: string, encoding: BufferEncoding = 'utf-8'): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Helper function to convert an ArrayBuffer to a string
 */
export function arrayBufferToString(buffer: ArrayBuffer | ArrayBufferView, encoding: BufferEncoding = 'utf-8'): string {
  const array = buffer instanceof ArrayBuffer 
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  
  const decoder = new TextDecoder(encoding);
  return decoder.decode(array);
}

/**
 * Helper function to create a DataView from a hex string
 */
export function hexToDataView(hex: string): DataViewWithHelpers {
  return DataViewWithHelpers.from(hexToArrayBuffer(hex));
}

// Re-export standard DataView for convenience
export { DataView };
