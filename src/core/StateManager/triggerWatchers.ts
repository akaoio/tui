/**
 * Trigger watchers method
 */

import { triggerWatchers as triggerWatchersUtil } from './watchers';

export function triggerWatchers(this: any, path: string, newValue: any, oldValue: any): void {
  triggerWatchersUtil(this._watchers, path, newValue, oldValue);
}