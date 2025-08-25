/**
 * Emit an event method
 */

import { EventPayload, EventHandler } from './types';
import { EventEmitter } from 'events';

export function emit(this: any, event: string, payload?: any): boolean {
  const fullPayload: EventPayload = {
    ...(typeof payload === 'object' && payload !== null ? payload : { data: payload }),
    timestamp: new Date()
  };
  
  // Add to history
  this.addToHistory && this.addToHistory(event, fullPayload);
  
  // Get handlers for this event
  const handlers = this.getHandlersForEvent ? this.getHandlersForEvent(event) : (this.handlers ? this.handlers.get(event) || new Set() : new Set());
  
  // Sort by priority
  const sortedHandlers = Array.from(handlers).sort((a, b) => {
    return ((a as EventHandler).priority || 0) - ((b as EventHandler).priority || 0);
  });
  
  let cancelled = false;
  
  // Execute handlers
  for (const handler of sortedHandlers as EventHandler[]) {
    // Check filter
    if (handler.filter && !handler.filter(fullPayload)) {
      continue;
    }
    
    // Execute handler with error handling
    try {
      const result = handler.handler(fullPayload);
      
      // Check if event was cancelled
      if (fullPayload.cancelable && result === false) {
        cancelled = true;
        break;
      }
      
      // Remove if once
      if (handler.once) {
        this.removeHandler(event, handler);
      }
    } catch (error) {
      // Continue execution even if handler throws error
      console.warn('EventBus handler error:', error);
      
      // Remove if once even on error
      if (handler.once) {
        this.removeHandler(event, handler);
      }
    }
  }
  
  // Call parent emit
  EventEmitter.prototype.emit.call(this, event, fullPayload);
  
  return !cancelled;
}