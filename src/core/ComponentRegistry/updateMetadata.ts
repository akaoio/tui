/**
 * ComponentRegistry updateMetadata method
 */

import { ComponentMetadata } from './types';

export function updateMetadata(
  this: any,
  id: string, 
  updates: Partial<ComponentMetadata>
): boolean {
  const ref = this.components.get(id);
  if (!ref) return false;
  
  Object.assign(ref.metadata, updates);
  ref.metadata.updatedAt = new Date();
  
  this.emit('metadataUpdate', { id, metadata: ref.metadata });
  
  return true;
}