/**
 * ComponentRegistry unregister method
 */

import { unmount } from './unmount';
import { updateComponentTree } from './updateComponentTree';

export function unregister(this: any, id: string): boolean {
  if (!id) return false;
  const ref = this.components.get(id);
  if (!ref) return false;
  
  // Unmount if mounted
  if (ref.metadata.mounted) {
    unmount.call(this, id);
  }
  
  // Remove from parent
  if (ref.metadata.parent) {
    const parent = this.components.get(ref.metadata.parent);
    if (parent) {
      const index = parent.metadata.children.indexOf(id);
      if (index > -1) {
        parent.metadata.children.splice(index, 1);
      }
    }
  }
  
  // Unregister children recursively
  const children = [...ref.metadata.children];
  children.forEach((childId: any) => {
    unregister.call(this, childId);
  });
  
  // Remove from type index
  const typeSet = this.componentsByType.get(ref.metadata.type);
  if (typeSet) {
    typeSet.delete(id);
    if (typeSet.size === 0) {
      this.componentsByType.delete(ref.metadata.type);
    }
  }
  
  // Remove component
  this.components.delete(id);
  
  // Update component tree
  updateComponentTree.call(this);
  
  // Emit event
  this.emit('unregister', { id });
  
  return true;
}