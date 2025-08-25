/**
 * ComponentRegistry get method
 */

import { ComponentRef } from './types';

export function get(this: any, id: string): ComponentRef | undefined {
  if (!id) return undefined;
  return this.components.get(id);
}