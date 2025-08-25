/**
 * Utility functions for ComponentRegistry
 */

/**
 * UUID v4 implementation (simple version)
 */
export function uuidv4(this: any): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate unique component ID
 */
export function generateId(this: any, prefix?: string): string {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8);
  return prefix ? `${prefix}_${uuid}` : uuid;
}