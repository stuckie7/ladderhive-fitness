
/**
 * Utility functions for handling ID conversion between string and number
 */

/**
 * Converts any ID (string or number) to number
 * @param id - ID to convert
 * @returns numeric ID
 */
export function toNumericId(id: string | number): number {
  if (typeof id === 'string') {
    return parseInt(id, 10);
  }
  return id;
}

/**
 * Converts any ID (string or number) to string
 * @param id - ID to convert
 * @returns string ID
 */
export function toStringId(id: string | number): string {
  return id?.toString() || '';
}

/**
 * Ensures consistent ID type based on the expected type
 * @param id - ID to process
 * @param type - Target type ('string' or 'number')
 * @returns Converted ID
 */
export function ensureIdType(id: string | number, type: 'string' | 'number'): string | number {
  if (type === 'string') {
    return toStringId(id);
  } else {
    return toNumericId(id);
  }
}
