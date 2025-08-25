/**
 * Time travel to specific state method
 */

export function timeTravel(this: any, index: number): void {
  if (index < 0 || index >= this._history.length) {
    throw new Error('Invalid history index');
  }
  
  // Reconstruct state up to that point
  // This is a simplified implementation
  // A full implementation would need to track full state snapshots
  
  this.emit('timeTravel', index);
}