/**
 * ComponentRegistry getAncestors method
 */

import { ComponentRef } from './types';

export function getAncestors(this: any, id: string): ComponentRef[] {
  const ancestors: ComponentRef[] = [];
  let currentRef = this.components.get(id);
  
  while (currentRef && currentRef.metadata.parent) {
    const parentRef = this.components.get(currentRef.metadata.parent);
    if (parentRef) {
      ancestors.push(parentRef);
      currentRef = parentRef;
    } else {
      break;
    }
  }
  
  return ancestors;
}