/**
 * ComponentRegistry clear method
 */

import { unmount } from './unmount';

export function clear(this: any): void {
  // Unmount all components
  this.mountedComponents.forEach((id: any) => {
    unmount.call(this, id);
  });
  
  // Clear all data structures
  this.components.clear();
  this.componentsByType.clear();
  this.componentTree.clear();
  this.mountedComponents.clear();
  
  this.emit('clear');
}