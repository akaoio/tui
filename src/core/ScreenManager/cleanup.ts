/**
 * ScreenManager cleanup method
 */

import { ANSI } from './types';
import { disableMouse } from './disableMouse';

export function cleanup(this: any): void {
  // Disable mouse
  if (this.isMouseEnabled) {
    disableMouse.call(this);
  }
  
  // Exit alternate screen
  if (this.isAlternateScreen) {
    this.stdout.write(ANSI.alternateScreenExit);
  }
  
  // Show cursor
  this.stdout.write(ANSI.showCursor);
  
  // Reset colors
  this.stdout.write(ANSI.reset);
  
  // Disable raw mode
  if (this.isRawMode && this.stdin.isTTY) {
    this.stdin.setRawMode(false);
  }
  
  // Close readline
  this.rl?.close();
}