import { ScreenState } from './types';

export function write(this: any, text: string): void {
  // Check if buffering is enabled
  if (this.buffering && Array.isArray(this.buffer)) {
    this.buffer.push(text);
  } else if (this.stdout && this.stdout.write) {
    this.stdout.write(text);
  }
}