/**
 * Get all getters getter method
 */

import { computeGetters } from './getters';

export function gettersGet(this: any): Record<string, any> {
  return computeGetters(this._getters, this._getterCache, this._state);
}