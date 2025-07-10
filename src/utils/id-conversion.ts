
/**
 * Converts any ID type (number, string, etc.) to a string representation
 */
export const toStringId = (id: any): string => {
  if (id === null || id === undefined) return '';
  return String(id);
};
