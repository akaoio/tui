/**
 * Get handlers for an event method
 */

import { EventHandler } from './types'

export function getHandlersForEvent(this: any, event: string): Set<EventHandler> {
  const handlers = new Set<EventHandler>()
  
  // Add specific event handlers
  if (this.handlers && this.handlers.has(event)) {
    this.handlers.get(event)!.forEach((h: any) => handlers.add(h))
  }
  
  // Add wildcard handlers
  if (this.wildcardHandlers) {
    this.wildcardHandlers.forEach((h: any) => handlers.add(h))
  }
  
  return handlers
}