/**
 * ComponentRegistry getChildren method
 */

import { ComponentRef } from './types';

export function getChildren(this: any, parentId: string): ComponentRef[] {
  const parentRef = this.components.get(parentId);
  if (!parentRef) return [];
  
  const children: ComponentRef[] = [];
  const childIds = parentRef.metadata.children || [];
  
  childIds.forEach((childId: string) => {
    const childRef = this.components.get(childId);
    if (childRef) {
      children.push(childRef);
    }
  });
  
  return children;
}