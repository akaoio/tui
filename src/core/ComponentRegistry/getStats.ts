/**
 * ComponentRegistry getStats method
 */

import { RegistryStats, ComponentRef } from './types';

function calculateMaxDepth(components: Map<string, ComponentRef>): number {
  let maxDepth = 0;
  const visited = new Set<string>();
  
  const calculateDepth = (id: string, currentDepth: number): number => {
    if (visited.has(id)) return currentDepth;
    visited.add(id);
    
    const ref = components.get(id);
    if (!ref) return currentDepth;
    
    maxDepth = Math.max(maxDepth, currentDepth);
    
    const children = ref.metadata.children || [];
    children.forEach(childId => {
      calculateDepth(childId, currentDepth + 1);
    });
    
    return maxDepth;
  };
  
  // Start from root components
  components.forEach((ref, id) => {
    if (!ref.metadata.parent) {
      calculateDepth(id, 1);
    }
  });
  
  return maxDepth;
}

export function getStats(this: any): RegistryStats {
  const byType: Record<string, number> = {};
  this.componentsByType.forEach((ids: Set<string>, type: string) => {
    byType[type] = ids.size;
  });
  
  const depth = calculateMaxDepth(this.components);
  
  return {
    total: this.components.size,
    mounted: this.mountedComponents.size,
    byType,
    depth
  };
}