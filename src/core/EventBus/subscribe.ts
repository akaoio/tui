/**
 * Subscribe to an event method
 */

import { EventHandler, EventSubscription, EventPayload } from './types';

export function subscribe(
  this: any,
  event: string,
  handler: (payload: EventPayload) => void | boolean,
  options?: {
    priority?: number;
    once?: boolean;
    filter?: (payload: EventPayload) => boolean;
  }
): EventSubscription {
  const id = `${event}_${Date.now()}_${Math.random()}`;
  
  const eventHandler: EventHandler = {
    id,
    handler,
    priority: options?.priority,
    once: options?.once,
    filter: options?.filter
  };
  
  // Add to handlers based on event type
  if (event === '*') {
    // Wildcard handler
    this.wildcardHandlers.add(eventHandler);
  } else if (event && event.includes(':*')) {
    // Namespace handler
    const namespace = event.split(':')[0];
    if (!this.channelHandlers.has(namespace)) {
      this.channelHandlers.set(namespace, new Map());
    }
    if (!this.channelHandlers.get(namespace)!.has('*')) {
      this.channelHandlers.get(namespace)!.set('*', new Set());
    }
    this.channelHandlers.get(namespace)!.get('*')!.add(eventHandler);
  } else {
    // Regular event handler
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(eventHandler);
  }
  
  // Return EventSubscription object
  return {
    unsubscribe: () => {
      if (event === '*') {
        this.wildcardHandlers.delete(eventHandler);
      } else if (event && event.includes(':*')) {
        const namespace = event.split(':')[0];
        if (this.channelHandlers.has(namespace) && this.channelHandlers.get(namespace)!.has('*')) {
          this.channelHandlers.get(namespace)!.get('*')!.delete(eventHandler);
        }
      } else {
        this.removeHandler(event, eventHandler);
      }
    }
  };
}