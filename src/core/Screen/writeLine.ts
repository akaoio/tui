import { ScreenState } from './types';
import { write } from './write';

export function writeLine(this: any, text: string): void {
  write.call(this, text + '\n');
}