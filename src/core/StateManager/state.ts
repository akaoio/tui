/**
 * Get current state getter method
 */

export function state<S>(this: any): S {
  return this._state;
}