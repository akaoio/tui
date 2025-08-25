import { ScreenState } from './types';
import { write } from './write';

export function moveCursor(this: any, x: number, y: number): void {
  write.call(this, `\x1b[${y + 1};${x + 1}H`);
}