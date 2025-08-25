/**
 * ScreenManager fillRegion method
 */

import { fillRegion as fillBufferRegion } from './bufferManagement';

export function fillRegion(
  this: any,
  region: any, 
  char: string, 
  style?: string
): void {
  fillBufferRegion(
    this.buffer,
    region.x,
    region.y,
    region.width,
    region.height,
    char,
    style
  );
}