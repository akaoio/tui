import { ScreenState } from './types';
import { write } from './write';

export function saveCursor(this: any): void {
  write.call(this, '\x1b[s');
}