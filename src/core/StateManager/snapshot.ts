/**
 * Create a snapshot of current state method
 */

export function snapshot<S>(this: any): S {
  return JSON.parse(JSON.stringify(this._state));
}