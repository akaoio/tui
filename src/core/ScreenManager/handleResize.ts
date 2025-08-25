/**
 * ScreenManager handleResize method
 */

import { createBuffer } from './bufferManagement';

export function handleResize(this: any): void {
  const newWidth = this.stdout.columns || 80;
  const newHeight = this.stdout.rows || 24;
  
  if (newWidth !== this.width || newHeight !== this.height) {
    this.width = newWidth;
    this.height = newHeight;
    
    // Resize buffer
    const newBuffer = createBuffer(newWidth, newHeight);
    
    // Copy old buffer content
    for (let y = 0; y < Math.min(this.height, newBuffer.length); y++) {
      for (let x = 0; x < Math.min(this.width, newBuffer[0].length); x++) {
        if (this.buffer[y]?.[x]) {
          newBuffer[y][x] = this.buffer[y][x];
        }
      }
    }
    
    this.buffer = newBuffer;
    this.prevBuffer = null;
    
    this.emit('resize', { width: newWidth, height: newHeight });
  }
}