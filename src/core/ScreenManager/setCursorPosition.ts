/**
 * ScreenManager setCursorPosition method
 */

export function setCursorPosition(this: any, x: number, y: number): void {
  this.cursorX = Math.max(0, Math.min(x, this.width - 1));
  this.cursorY = Math.max(0, Math.min(y, this.height - 1));
}