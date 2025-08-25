/**
 * ScreenManager write method
 */

import { writeToBuffer } from './bufferManagement';

export function write(
  this: any,
  text: string, 
  x: number, 
  y: number, 
  style?: string
): void {
  writeToBuffer(this.buffer, text, x, y, style, this.width, this.height);
}