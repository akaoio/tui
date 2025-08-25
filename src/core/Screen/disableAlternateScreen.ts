import { ScreenState } from './types';
import { write } from './write';

export function disableAlternateScreen(this: any): void {
  write.call(this, '\x1b[?1049l');
}