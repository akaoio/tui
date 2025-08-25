/**
 * Generate ASCII tree representation of component hierarchy
 */

import { ComponentRef } from './types';

export function tree(this: any, rootId?: string): string {
  const lines: string[] = [];
  const visited = new Set<string>();
  
  const buildTree = (id: string, prefix: string = '', isLast: boolean = true) => {
    if (visited.has(id)) return;
    visited.add(id);
    
    const ref = this.components.get(id);
    if (!ref) return;
    
    const connector = isLast ? '└── ' : '├── ';
    const line = prefix + connector + ref.metadata.type + ' #' + id;
    lines.push(line);
    
    const children = ref.metadata.children || [];
    children.forEach((childId: string, index: number) => {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      const childIsLast = index === children.length - 1;
      buildTree(childId, childPrefix, childIsLast);
    });
  };
  
  if (rootId) {
    buildTree(rootId);
  } else {
    // Find root components (no parent)
    const roots: string[] = [];
    this.components.forEach((ref: ComponentRef) => {
      if (!ref.metadata.parent) {
        roots.push(ref.id);
      }
    });
    
    roots.forEach((id, index) => {
      buildTree(id, '', index === roots.length - 1);
    });
  }
  
  return lines.join('\n');
}

/**
 * Get ancestors of a component
 */
export function getAncestors(this: any, id: string): string[] {
  const ancestors: string[] = [];
  let currentId = id;
  
  while (currentId) {
    const ref = this.components.get(currentId);
    if (!ref || !ref.metadata.parent) break;
    
    ancestors.push(ref.metadata.parent);
    currentId = ref.metadata.parent;
  }
  
  return ancestors;
}

/**
 * Get children of a component
 */
export function getChildren(this: any, id: string): string[] {
  const ref = this.components.get(id);
  return ref ? (ref.metadata.children || []) : [];
}

/**
 * Get tree as JSON
 */
export function getTreeJSON(this: any, rootId?: string): any {
  const visited = new Set<string>();
  
  const buildJSON = (id: string): any => {
    if (visited.has(id)) return null;
    visited.add(id);
    
    const ref = this.components.get(id);
    if (!ref) return null;
    
    const children = (ref.metadata.children || [])
      .map((childId: string) => buildJSON(childId))
      .filter((child: any) => child !== null);
    
    return {
      id,
      type: ref.metadata.type,
      children: children.length > 0 ? children : undefined
    };
  };
  
  if (rootId) {
    return buildJSON(rootId);
  } else {
    // Find root components
    const roots: any[] = [];
    this.components.forEach((ref: ComponentRef) => {
      if (!ref.metadata.parent) {
        const rootJSON = buildJSON(ref.id);
        if (rootJSON) roots.push(rootJSON);
      }
    });
    return roots;
  }
}

/**
 * Calculate maximum depth of component tree
 */
export function calculateMaxDepth(this: any, rootId?: string): number {
  const visited = new Set<string>();
  
  const getDepth = (id: string): number => {
    if (visited.has(id)) return 0;
    visited.add(id);
    
    const ref = this.components.get(id);
    if (!ref) return 0;
    
    const children = ref.metadata.children || [];
    if (children.length === 0) return 1;
    
    let maxChildDepth = 0;
    children.forEach((childId: string) => {
      const childDepth = getDepth(childId);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    });
    
    return 1 + maxChildDepth;
  };
  
  if (rootId) {
    return getDepth(rootId);
  } else {
    // Find maximum depth across all roots
    let maxDepth = 0;
    this.components.forEach((ref: ComponentRef) => {
      if (!ref.metadata.parent) {
        const depth = getDepth(ref.id);
        maxDepth = Math.max(maxDepth, depth);
      }
    });
    return maxDepth;
  }
}