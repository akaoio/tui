/**
 * ComponentRegistry getMounted method
 */

import { ComponentRef } from './types';

export function getMounted(this: any): ComponentRef[] {
  return Array.from(this.mountedComponents)
    .map((id: any) => this.components.get(id))
    .filter((ref: any) => ref !== undefined) as ComponentRef[];
}