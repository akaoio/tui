/**
 * Get state history method
 */

import { StateChange } from './types';

export function getHistory(this: any): StateChange[] {
  return [...this._history];
}