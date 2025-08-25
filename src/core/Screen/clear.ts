import { ScreenState } from './types';
import { write } from './write';
import { moveCursor } from './moveCursor';

export function clear(this: any): void {
  write.call(this, '\x1b[2J');
  moveCursor.call(this, 0, 0);
}