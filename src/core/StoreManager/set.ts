/**
 * Set a state value directly method
 */

export function set(this: any, path: string, value: any): void {
  const parts = path.split('.');
  const lastPart = parts.pop();
  
  if (!lastPart) return;
  
  let current: any = this.store.state;
  
  for (const part of parts) {
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[lastPart] = value;
  
  this.emit('state-change', {
    path,
    value,
    state: this.store.state
  });
}