/**
 * Set parent-child relationship between components
 */

import { ComponentRef } from './types';

export function setParent(this: any, childId: string, parentId: string | null): void {
  const childRef = this.components.get(childId);
  if (!childRef) return;
  
  // Remove from old parent if exists
  if (childRef.metadata.parent) {
    const oldParentRef = this.components.get(childRef.metadata.parent);
    if (oldParentRef) {
      const index = oldParentRef.metadata.children.indexOf(childId);
      if (index !== -1) {
        oldParentRef.metadata.children.splice(index, 1);
      }
    }
  }
  
  // Set new parent
  childRef.metadata.parent = parentId || undefined;
  
  // Add to new parent's children
  if (parentId) {
    const parentRef = this.components.get(parentId);
    if (parentRef && !parentRef.metadata.children.includes(childId)) {
      parentRef.metadata.children.push(childId);
    }
  }
  
  // Update tree
  this.emit('parentChange', { childId, parentId });
}