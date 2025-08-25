/**
 * ScreenManager flush method
 */

import { flushBuffer, copyBuffer } from './bufferManagement';

export function flush(this: any): void {
  flushBuffer(
    this.buffer,
    this.prevBuffer,
    (data) => this.stdout.write(data),
    this.width,
    this.height,
    this.cursorX,
    this.cursorY,
    this.cursorVisible
  );
  this.prevBuffer = copyBuffer(this.buffer);
}