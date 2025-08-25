import { ScreenState } from './types';

export function flushBuffer(this: any): void {
  if (this.buffer && this.buffer.length > 0) {
    const content = this.buffer.join('');
    this.buffer = null; // Clear buffer flag
    this.stdout.write(content); // Write directly to avoid re-buffering
    this.buffer = []; // Reset buffer
  }
}