/**
 * ComponentRegistry moveToParent method
 */

import { updateComponentTree } from './updateComponentTree';
import { ComponentRef } from './types';

function wouldCreateCircularDependency(
  childId: string, 
  newParentId: string, 
  components: Map<string, ComponentRef>
): boolean {
  let current: string | undefined = newParentId;
  while (current) {
    if (current === childId) return true;
    const ref = components.get(current);
    current = ref?.metadata.parent;
  }
  return false;
}

export function moveToParent(
  this: any,
  id: string, 
  newParentId: string | null
): boolean {
  const ref = this.components.get(id);
  if (!ref) return false;
  
  // Remove from old parent
  if (ref.metadata.parent) {
    const oldParent = this.components.get(ref.metadata.parent);
    if (oldParent) {
      const index = oldParent.metadata.children.indexOf(id);
      if (index > -1) {
        oldParent.metadata.children.splice(index, 1);
      }
    }
  }
  
  // Add to new parent
  if (newParentId) {
    const newParent = this.components.get(newParentId);
    if (!newParent) return false;
    
    // Check for circular dependency
    if (wouldCreateCircularDependency(id, newParentId, this.components)) {
      throw new Error('Moving component would create circular dependency');
    }
    
    newParent.metadata.children.push(id);
    ref.metadata.parent = newParentId;
  } else {
    ref.metadata.parent = undefined;
  }
  
  updateComponentTree.call(this);
  
  this.emit('move', { id, newParentId });
  
  return true;
}