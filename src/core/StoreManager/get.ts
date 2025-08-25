/**
 * Get a specific state value method
 */

export function get(this: any, path: string): any {
  const parts = path.split('.');
  let current: any = this.store.state;
  
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = current[part];
    } else {
      return undefined;
    }
  }
  
  return current;
}