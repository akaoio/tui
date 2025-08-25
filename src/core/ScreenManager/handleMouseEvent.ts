/**
 * ScreenManager handleMouseEvent method
 */

import { MouseEvent } from './types';

export function handleMouseEvent(this: any, event: MouseEvent): void {
  // Route to virtual cursor if in cursor mode
  if (this.cursorMode) {
    this.virtualCursorManager.handleMouseEvent(event);
    return;
  }
  
  // Find component at position
  for (const [id, info] of this.components) {
    const { region, component } = info;
    if (event.x >= region.x && 
        event.x < region.x + region.width &&
        event.y >= region.y && 
        event.y < region.y + region.height) {
      
      // Convert to component-relative coordinates
      const relativeEvent = {
        ...event,
        x: event.x - region.x,
        y: event.y - region.y
      };
      
      // Send to component
      if (component.handleMouse) {
        component.handleMouse(relativeEvent);
      }
      
      this.emit('mouse', event);
      return;
    }
  }
  
  // No component found, emit global event
  this.emit('mouse', event);
}