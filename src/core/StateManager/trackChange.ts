/**
 * Track state change method
 */

import { trackChange as trackChangeUtil } from './reactive';

export function trackChange(this: any, path: string, oldValue: any, newValue: any): void {
  trackChangeUtil(this._history, this._maxHistory, path, oldValue, newValue);
}