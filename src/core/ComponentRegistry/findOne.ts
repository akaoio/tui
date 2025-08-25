/**
 * ComponentRegistry findOne method
 */

import { ComponentRef } from './types';

export function findOne(
  this: any,
  predicate: (ref: ComponentRef) => boolean
): ComponentRef | undefined {
  const values = Array.from(this.components.values()) as ComponentRef[];
  return values.find(predicate);
}