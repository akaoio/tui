import { ScreenState } from './types';
import { saveCursor } from './saveCursor';
import { moveCursor } from './moveCursor';
import { write } from './write';
import { restoreCursor } from './restoreCursor';

export function writeAt(this: any, x: number, y: number, text: string): void {
  saveCursor.call(this);
  moveCursor.call(this, x, y);
  write.call(this, text);
  restoreCursor.call(this);
}