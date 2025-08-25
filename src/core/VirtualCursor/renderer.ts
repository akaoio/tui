/**
 * Cursor rendering logic
 */

import { ScreenManager } from '../ScreenManager/index';
import { CursorPosition } from './types';

export class CursorRenderer {
  private blinkInterval: NodeJS.Timeout | null = null;
  private blinkState: boolean = true;
  private savedChar: string = ' ';
  private savedStyle: string = '';

  constructor(
    private screen: ScreenManager,
    private cursorChar: string = '█',
    private cursorStyle: string = '\x1b[93m' // Bright yellow
  ) {}

  startBlinking(position: CursorPosition, onRender: () => void, onRestore: () => void): void {
    if (this.blinkInterval) return;
    
    this.blinkInterval = setInterval(() => {
      this.blinkState = !this.blinkState;
      
      if (this.blinkState) {
        onRender();
      } else {
        onRestore();
      }
    }, 500); // Blink every 500ms
  }

  stopBlinking(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    this.blinkState = true;
  }

  render(position: CursorPosition): void {
    if (!this.blinkState) return;
    
    // Save what's under the cursor
    // Note: In real implementation, we'd read from screen buffer
    this.savedChar = ' ';
    this.savedStyle = '';
    
    // Draw cursor
    this.screen.write(
      this.cursorChar,
      position.x,
      position.y,
      this.cursorStyle
    );
    
    // Force flush to ensure cursor is visible
    ;(this.screen as any).flush?.();
  }

  restore(position: CursorPosition): void {
    // Restore what was under the cursor
    this.screen.write(
      this.savedChar,
      position.x,
      position.y,
      this.savedStyle
    );
  }

  setCursorChar(char: string): void {
    this.cursorChar = char;
  }

  setCursorStyle(style: string): void {
    this.cursorStyle = style;
  }
}