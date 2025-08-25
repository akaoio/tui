import { ScreenState } from './types';
import { write } from './write';

export function restoreCursor(this: any): void {
  write.call(this, '\x1b[u');
}