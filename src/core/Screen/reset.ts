import { ScreenState } from './types';
import { write } from './write';

export function reset(this: any): void {
  write.call(this, '\x1b[0m');
}