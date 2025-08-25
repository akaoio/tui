/**
 * Replace state method
 */

import { makeReactive } from './reactive';

export function replaceState<S>(this: any, state: S): void {
  this._committing = true;
  this._state = makeReactive(state, '', this);
  this._committing = false;
  
  this._getterCache.clear();
  this.emit('replaceState', state);
}