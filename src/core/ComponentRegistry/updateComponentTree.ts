/**
 * ComponentRegistry updateComponentTree method
 */

import { ComponentRef } from './types';

export function updateComponentTree(this: any): void {
  // Rebuild the component tree map
  this.componentTree.clear();
  
  this.components.forEach((ref: ComponentRef, id: string) => {
    const children = ref.metadata.children || [];
    if (children.length > 0) {
      this.componentTree.set(id, children);
    }
  });
  
  this.emit('treeUpdate', this.componentTree);
}