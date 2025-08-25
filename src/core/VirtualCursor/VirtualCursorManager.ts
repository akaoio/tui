/**
 * Virtual Cursor Manager - Singleton
 */

import { ScreenManager } from '../ScreenManager/index';
import { VirtualCursor } from './VirtualCursor';

export class VirtualCursorManager {
  private static instance: VirtualCursorManager;
  private cursor: VirtualCursor | null = null;
  private enabled: boolean = false;

  private constructor() {}

  static getInstance(): VirtualCursorManager {
    if (!VirtualCursorManager.instance) {
      VirtualCursorManager.instance = new VirtualCursorManager();
    }
    return VirtualCursorManager.instance;
  }

  initialize(screen: ScreenManager): VirtualCursor {
    if (!this.cursor) {
      this.cursor = new VirtualCursor(screen);
      
      // Hide real cursor when virtual cursor is active
      this.cursor.on('show', () => {
        screen.setCursorVisible(false);
      });
      
      this.cursor.on('hide', () => {
        // Don't restore real cursor automatically
        // Let app decide
      });
    }
    return this.cursor;
  }

  getCursor(): VirtualCursor | null {
    return this.cursor;
  }

  enable(): void {
    if (!this.cursor) {
      throw new Error('Virtual cursor not initialized. Call initialize() first.');
    }
    this.enabled = true;
    this.cursor.show();
  }

  disable(): void {
    if (this.cursor) {
      this.enabled = false;
      this.cursor.hide();
    }
  }

  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  handleInput(sequence: string): boolean {
    if (!this.enabled || !this.cursor) return false;
    // Input handling delegated to individual cursor
    return false;
  }
  
  handleMouseEvent(event: any): boolean {
    if (!this.enabled || !this.cursor) return false;
    // Mouse event handling delegated to individual cursor
    return false;
  }
}