/**
 * ComponentRegistry getByType method
 */

import { ComponentRef } from './types';

export function getByType(this: any, type: string): ComponentRef[] {
  const ids = this.componentsByType.get(type);
  if (!ids) return [];
  
  return Array.from(ids)
    .map((id: any) => this.components.get(id))
    .filter((ref: any) => ref !== undefined) as ComponentRef[];
}