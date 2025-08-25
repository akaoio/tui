/**
 * ComponentRegistry getAll method
 */

import { ComponentRef } from './types';

export function getAll(this: any): ComponentRef[] {
  return Array.from(this.components.values());
}