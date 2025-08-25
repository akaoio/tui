import { ScreenState } from './types';
import { write } from './write';

export function clearLine(this: any): void {
  write.call(this, '\x1b[2K');
}