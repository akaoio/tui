/**
 * ScreenManager handleInput method
 */

import { isMouseSequence, parseSGRMouse } from './mouseHandling';
import { handleMouseEvent } from './handleMouseEvent';
import { emitKeypress } from './emitKeypress';

export function handleInput(this: any, data: Buffer): void {
  const sequence = data.toString();
  
  // Handle mouse events
  if (this.isMouseEnabled && isMouseSequence(sequence)) {
    const mouseEvent = parseSGRMouse(sequence);
    if (mouseEvent) {
      handleMouseEvent.call(this, mouseEvent);
    }
    return;
  }
  
  // Handle cursor mode
  if (this.cursorMode) {
    this.virtualCursorManager.handleInput(sequence);
    return;
  }
  
  // Emit keypress event
  emitKeypress.call(this, sequence);
}