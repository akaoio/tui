import { KeyEvent } from './types';

/**
 * Register keypress callback
 */
export function onKeypress(this: any, callback: (event: KeyEvent) => void): void {
  this.on('keypress', callback);
}