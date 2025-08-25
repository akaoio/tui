/**
 * Main VirtualCursor class
 */

import { EventEmitter } from 'events';
import { ScreenManager } from '../ScreenManager/index';
import { CursorPosition } from './types';
import { CursorRenderer } from './renderer';
import { CursorInputHandler } from './inputHandler';
import { CursorPositionManager } from './positionManager';

export class VirtualCursor extends EventEmitter {
  private visible: boolean = false;
  private renderer: CursorRenderer;
  private inputHandler: CursorInputHandler;
  private positionManager: CursorPositionManager;

  constructor(private screen: ScreenManager) {
    super();
    
    const dimensions = screen.getDimensions();
    this.positionManager = new CursorPositionManager({
      width: dimensions.width,
      height: dimensions.height
    });
    
    this.renderer = new CursorRenderer(screen);
    this.inputHandler = new CursorInputHandler(this, (dx, dy) => this.move(dx, dy));
    
    // Listen for screen resize
    screen.on('resize', () => {
      const dimensions = screen.getDimensions();
      this.positionManager.updateBounds({
        width: dimensions.width,
        height: dimensions.height
      });
    });
  }

  /**
   * Show the virtual cursor
   */
  show(): void {
    if (this.visible) return;
    
    this.visible = true;
    this.renderer.startBlinking(
      this.positionManager.getPosition(),
      () => this.render(),
      () => this.restore()
    );
    this.render();
    this.emit('show');
  }

  /**
   * Hide the virtual cursor
   */
  hide(): void {
    if (!this.visible) return;
    
    this.visible = false;
    this.renderer.stopBlinking();
    this.restore();
    this.emit('hide');
  }

  /**
   * Toggle cursor visibility
   */
  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Move cursor to absolute position
   */
  moveTo(x: number, y: number): void {
    if (!this.visible) return;
    
    // Restore previous position
    this.restore();
    
    // Update position
    const newPosition = this.positionManager.moveTo(x, y);
    
    // Render at new position
    this.render();
    
    this.emit('move', newPosition);
  }

  /**
   * Move cursor relatively
   */
  move(dx: number, dy: number): void {
    const currentPos = this.positionManager.getPosition();
    this.moveTo(currentPos.x + dx, currentPos.y + dy);
  }

  /**
   * Move cursor with arrow keys
   */
  moveUp(): void { this.move(0, -1); }
  moveDown(): void { this.move(0, 1); }
  moveLeft(): void { this.move(-1, 0); }
  moveRight(): void { this.move(1, 0); }

  /**
   * Get current position
   */
  getPosition(): CursorPosition {
    return this.positionManager.getPosition();
  }

  /**
   * Set cursor character
   */
  setCursorChar(char: string): void {
    this.renderer.setCursorChar(char);
    if (this.visible) {
      this.render();
    }
  }

  /**
   * Set cursor style (ANSI color code)
   */
  setCursorStyle(style: string): void {
    this.renderer.setCursorStyle(style);
    if (this.visible) {
      this.render();
    }
  }

  /**
   * Handle keyboard input for cursor movement
   */
  handleInput(char: string, key: any): boolean {
    if (!this.visible) return false;
    return this.inputHandler.handleInput(char, key, this.positionManager.getPosition());
  }

  /**
   * Check if position is at specific coordinates
   */
  isAt(x: number, y: number): boolean {
    return this.positionManager.isAt(x, y);
  }

  /**
   * Check if position is within a region
   */
  isInRegion(x: number, y: number, width: number, height: number): boolean {
    return this.positionManager.isInRegion(x, y, width, height);
  }

  /**
   * Get the component at cursor position
   */
  getComponentAt(): string | null {
    // This would integrate with component registry
    // For now, emit event for app to handle
    this.emit('query', this.positionManager.getPosition());
    return null;
  }

  private render(): void {
    if (!this.visible) return;
    this.renderer.render(this.positionManager.getPosition());
  }

  private restore(): void {
    this.renderer.restore(this.positionManager.getPosition());
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.hide();
    this.removeAllListeners();
  }
}