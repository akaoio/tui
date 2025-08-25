/**
 * ComponentRegistry getTreeJSON method
 */

import { ComponentRef } from './types';

interface TreeNode {
  id: string;
  type: string;
  children: TreeNode[];
}

export function getTreeJSON(this: any): TreeNode[] {
  const roots: TreeNode[] = [];
  const visited = new Set<string>();
  
  const buildNode = (id: string): TreeNode | null => {
    if (visited.has(id)) return null;
    visited.add(id);
    
    const ref: ComponentRef = this.components.get(id);
    if (!ref) return null;
    
    const node: TreeNode = {
      id: ref.id,
      type: ref.metadata.type,
      children: []
    };
    
    const childIds = ref.metadata.children || [];
    childIds.forEach(childId => {
      const childNode = buildNode(childId);
      if (childNode) {
        node.children.push(childNode);
      }
    });
    
    return node;
  };
  
  // Find root components (no parent)
  this.components.forEach((ref: ComponentRef) => {
    if (!ref.metadata.parent) {
      const node = buildNode(ref.id);
      if (node) {
        roots.push(node);
      }
    }
  });
  
  // If no roots, return all components as tree
  if (roots.length === 0) {
    this.components.forEach((ref: ComponentRef) => {
      if (!visited.has(ref.id)) {
        const node = buildNode(ref.id);
        if (node) {
          roots.push(node);
        }
      }
    });
  }
  
  return roots;
}