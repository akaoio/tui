/**
 * Input handling for VirtualCursor
 */

import { EventEmitter } from 'events';
import { CursorPosition } from './types';

export class CursorInputHandler {
  constructor(private emitter: EventEmitter, private moveCallback: (dx: number, dy: number) => void) {}

  handleInput(char: string, key: any, position: CursorPosition): boolean {
    // Arrow keys
    if (key?.name === 'up' || char === 'w') {
      this.moveCallback(0, -1);
      return true;
    }
    if (key?.name === 'down' || char === 's') {
      this.moveCallback(0, 1);
      return true;
    }
    if (key?.name === 'left' || char === 'a') {
      this.moveCallback(-1, 0);
      return true;
    }
    if (key?.name === 'right' || char === 'd') {
      this.moveCallback(1, 0);
      return true;
    }
    
    // Space or Enter to "click"
    if (char === ' ' || key?.name === 'return' || key?.name === 'enter') {
      this.emitter.emit('click', position);
      return true;
    }
    
    return false;
  }

  handleMouseEvent(event: any): boolean {
    // Mouse events not implemented for VirtualCursor
    return false;
  }

  handleSequence(sequence: string): boolean {
    // Sequence handling not implemented for VirtualCursor
    return false;
  }
}