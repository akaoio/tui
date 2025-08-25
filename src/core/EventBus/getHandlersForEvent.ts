/**
 * Get handlers for an event (private method)
 */

import { EventHandler } from './types';

export function getHandlersForEvent(this: any, event: string): Set<EventHandler> {
  const handlers = new Set<EventHandler>();
  
  // Add specific event handlers
  if (this.handlers.has(event)) {
    this.handlers.get(event)!.forEach((h: any) => handlers.add(h));
  }
  
  // Add wildcard handlers
  this.wildcardHandlers.forEach((h: any) => handlers.add(h));
  
  // Add namespace handlers (app:* matches app:start, app:stop, etc.)
  if (event && event.includes(':')) {
    const namespace = event.split(':')[0];
    if (this.channelHandlers.has(namespace) && this.channelHandlers.get(namespace)!.has('*')) {
      this.channelHandlers.get(namespace)!.get('*')!.forEach((h: any) => handlers.add(h));
    }
  }
  
  return handlers;
}