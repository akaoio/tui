import { ScreenState } from './types';
import { write } from './write';

export function hideCursor(this: any): void {
  write.call(this, '\x1b[?25l');
}