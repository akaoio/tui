/**
 * Get current state method
 */

export function getState(this: any): Record<string, any> {
  return this.store.state;
}