import { ScreenState } from './types';
import { write } from './write';

export function enableAlternateScreen(this: any): void {
  write.call(this, '\x1b[?1049h');
}