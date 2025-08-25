/**
 * ScreenManager clear method
 */

import { clearBuffer } from './bufferManagement';

export function clear(this: any): void {
  clearBuffer(this.buffer, this.width, this.height);
  this.prevBuffer = null;
}