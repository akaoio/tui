import { Key, KeyEvent } from './types';

/**
 * Register key callback
 */
export function onKey(this: any, callback: (key: Key, event: KeyEvent) => void): void {
  this.on('key', callback);
}