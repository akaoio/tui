/**
 * Get the store instance method
 */

import { Store } from './types';

export function getStore(this: any): Store {
  return this.store;
}