/**
 * ScreenManager emitKeypress method
 */

import { parseKey } from './parseKey';

export function emitKeypress(this: any, sequence: string): void {
  // Parse key
  const key = parseKey.call(this, sequence);
  this.emit('keypress', sequence, key);
}