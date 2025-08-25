/**
 * Buffer management methods for ScreenManager
 */

import { Cell, ANSI } from './types';

/**
 * Initialize an empty buffer
 */
export function createBuffer(this: any, width: number, height: number): Cell[][] {
  const buffer: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    buffer[y] = [];
    for (let x = 0; x < width; x++) {
      buffer[y][x] = { char: ' ' };
    }
  }
  return buffer;
}

/**
 * Clear buffer
 */
export function clearBuffer(this: any, buffer: Cell[][], width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (buffer[y] && buffer[y][x]) {
        buffer[y][x] = { char: ' ' };
      }
    }
  }
}

/**
 * Write text to buffer at position
 */
export function writeToBuffer(this: any, buffer: Cell[][],
  text: string,
  x: number,
  y: number,
  style?: string,
  width?: number,
  height?: number): void {
  if (y < 0 || y >= (height || buffer.length)) return;
  
  const maxWidth = width || buffer[0]?.length || 80;
  
  for (let i = 0; i < text.length && x + i < maxWidth; i++) {
    if (buffer[y] && x + i >= 0) {
      buffer[y][x + i] = {
        char: text[i],
        style: style
      };
    }
  }
}

/**
 * Flush buffer to output stream
 */
export function flushBuffer(
  buffer: Cell[][],
  prevBuffer: Cell[][] | null,
  write: (data: string) => void,
  width: number,
  height: number,
  cursorX: number,
  cursorY: number,
  cursorVisible: boolean
): void {
  let output = '';
  let lastStyle = '';
  
  for (let y = 0; y < height; y++) {
    let lineChanged = false;
    let lineOutput = '';
    let currentX = 0;
    
    for (let x = 0; x < width; x++) {
      const cell = buffer[y]?.[x];
      const prevCell = prevBuffer?.[y]?.[x];
      
      // Check if cell changed
      if (!prevCell || 
          cell?.char !== prevCell.char || 
          cell?.style !== prevCell.style) {
        lineChanged = true;
        
        // Move cursor if needed
        if (currentX < x) {
          lineOutput += ANSI.cursorColumn(x + 1);
          currentX = x;
        }
        
        // Apply style if changed
        if (cell?.style && cell.style !== lastStyle) {
          lineOutput += cell.style;
          lastStyle = cell.style;
        } else if (!cell?.style && lastStyle) {
          lineOutput += ANSI.reset;
          lastStyle = '';
        }
        
        lineOutput += cell?.char || ' ';
        currentX++;
      }
    }
    
    if (lineChanged) {
      output += ANSI.cursorPosition(y + 1, 1) + lineOutput;
    }
  }
  
  // Reset style at end
  if (lastStyle) {
    output += ANSI.reset;
  }
  
  // Position cursor
  if (cursorVisible) {
    output += ANSI.cursorPosition(cursorY + 1, cursorX + 1);
    output += ANSI.showCursor;
  } else {
    output += ANSI.hideCursor;
  }
  
  if (output) {
    write(output);
  }
}

/**
 * Copy buffer for comparison
 */
export function copyBuffer(this: any, buffer: Cell[][]): Cell[][] {
  return buffer.map((row: any) => 
    row.map((cell: any) => ({ ...cell }))
  );
}

/**
 * Fill region with character and style
 */
export function fillRegion(this: any, buffer: Cell[][],
  x: number,
  y: number,
  width: number,
  height: number,
  char: string,
  style?: string): void {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const px = x + dx;
      const py = y + dy;
      
      if (py >= 0 && py < buffer.length && px >= 0 && px < buffer[0]?.length) {
        buffer[py][px] = { char, style };
      }
    }
  }
}