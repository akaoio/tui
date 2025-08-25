/**
 * Position management for VirtualCursor
 */

import { CursorPosition, CursorBounds } from './types';

export class CursorPositionManager {
  private position: CursorPosition = { x: 0, y: 0 };
  private bounds: CursorBounds;

  constructor(bounds: CursorBounds) {
    this.bounds = bounds;
  }

  getPosition(): CursorPosition {
    return { ...this.position };
  }

  moveTo(x: number, y: number): CursorPosition {
    this.position.x = x;
    this.position.y = y;
    this.constrainPosition();
    return this.getPosition();
  }

  move(dx: number, dy: number): CursorPosition {
    return this.moveTo(this.position.x + dx, this.position.y + dy);
  }

  moveUp(): CursorPosition { return this.move(0, -1); }
  moveDown(): CursorPosition { return this.move(0, 1); }
  moveLeft(): CursorPosition { return this.move(-1, 0); }
  moveRight(): CursorPosition { return this.move(1, 0); }

  updateBounds(bounds: CursorBounds): void {
    this.bounds = bounds;
    this.constrainPosition();
  }

  isAt(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y;
  }

  isInRegion(x: number, y: number, width: number, height: number): boolean {
    return this.position.x >= x && 
           this.position.x < x + width &&
           this.position.y >= y && 
           this.position.y < y + height;
  }

  private constrainPosition(): void {
    this.position.x = Math.max(0, Math.min(this.bounds.width - 1, this.position.x));
    this.position.y = Math.max(0, Math.min(this.bounds.height - 1, this.position.y));
  }
}