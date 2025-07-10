
export class DataViewWithHelpers {
  private view: DataView;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  static from(buffer: ArrayBuffer): DataViewWithHelpers {
    return new DataViewWithHelpers(buffer);
  }

  getUint8(byteOffset: number): number {
    return this.view.getUint8(byteOffset);
  }

  getUint16(byteOffset: number, littleEndian?: boolean): number {
    return this.view.getUint16(byteOffset, littleEndian);
  }

  getUint32(byteOffset: number, littleEndian?: boolean): number {
    return this.view.getUint32(byteOffset, littleEndian);
  }

  getInt8(byteOffset: number): number {
    return this.view.getInt8(byteOffset);
  }

  getInt16(byteOffset: number, littleEndian?: boolean): number {
    return this.view.getInt16(byteOffset, littleEndian);
  }

  getInt32(byteOffset: number, littleEndian?: boolean): number {
    return this.view.getInt32(byteOffset, littleEndian);
  }

  getFloat32(byteOffset: number, littleEndian?: boolean): number {
    return this.view.getFloat32(byteOffset, littleEndian);
  }

  getFloat64(byteOffset: number, littleEndian?: boolean): number {
    return this.view.getFloat64(byteOffset, littleEndian);
  }

  // Helper method to get boolean from a specific bit in a byte
  getBit(byteOffset: number, bitPosition: number): boolean {
    if (bitPosition < 0 || bitPosition > 7) {
      throw new Error('Bit position must be between 0 and 7');
    }
    const byte = this.view.getUint8(byteOffset);
    return ((byte >> bitPosition) & 1) === 1;
  }

  // Get a subset of the buffer
  slice(start: number, end?: number): DataViewWithHelpers {
    const newBuffer = this.view.buffer.slice(start, end);
    return new DataViewWithHelpers(newBuffer);
  }

  // Get the raw buffer
  get buffer(): ArrayBuffer {
    return this.view.buffer;
  }

  // Get the byte length of the buffer
  get byteLength(): number {
    return this.view.byteLength;
  }

  // Convert to string using TextDecoder
  toString(start: number = 0, length?: number): string {
    const end = length !== undefined ? start + length : this.byteLength;
    const slice = this.view.buffer.slice(start, end);
    return new TextDecoder().decode(slice);
  }

  // Get a hexadecimal string representation of the buffer
  toHexString(separator: string = ' '): string {
    const bytes = new Uint8Array(this.view.buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(separator);
  }
}
