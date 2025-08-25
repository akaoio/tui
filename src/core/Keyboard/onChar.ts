import { KeyEvent } from './types';

/**
 * Register char callback
 */
export function onChar(this: any, callback: (char: string, event: KeyEvent) => void): void {
  this.on('char', callback);
}