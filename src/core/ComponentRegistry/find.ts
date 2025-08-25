/**
 * ComponentRegistry find method
 */

import { ComponentRef } from './types';

export function find(
  this: any,
  predicate: (ref: ComponentRef) => boolean
): ComponentRef[] {
  const values = Array.from(this.components.values()) as ComponentRef[];
  return values.filter(predicate);
}