/**
 * EventBus - Container class
 * Global Event Bus for Component Communication
 */

import { EventEmitter } from 'events';
import { EventPayload, EventHandler, EventSubscription, EventHistoryEntry } from './types';
import { constructor } from './constructor';
import { getInstance } from './getInstance';
import { emit } from './emit';
import { subscribe } from './subscribe';
import { getHandlersForEvent } from './getHandlersForEvent';
import { removeHandler } from './removeHandler';
import { addToHistory } from './addToHistory';
import { getHistory } from './getHistory';
import { clearHistory } from './clearHistory';
import { reset } from './reset';

/**
 * Event Bus - Singleton
 */
export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: EventHistoryEntry[] = [];
  private maxHistory = 1000;
  private wildcardHandlers: Set<EventHandler> = new Set();
  private channelHandlers: Map<string, Map<string, Set<EventHandler>>> = new Map();
  
  private constructor() {
    super();
    constructor.call(this);
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    return getInstance.call(EventBus);
  }
  
  /**
   * Emit an event
   */
  override emit(event: string, payload?: Partial<EventPayload>): boolean {
    return emit.call(this, event, payload);
  }
  
  /**
   * Subscribe to an event
   */
  subscribe(
    event: string,
    handler: (payload: EventPayload) => void | boolean,
    options?: {
      priority?: number;
      once?: boolean;
      filter?: (payload: EventPayload) => boolean;
    }
  ): EventSubscription {
    return subscribe.call(this, event, handler, options);
  }
  
  /**
   * Get handlers for an event
   */
  private getHandlersForEvent(event: string): Set<EventHandler> {
    return getHandlersForEvent.call(this, event);
  }
  
  /**
   * Remove a handler
   */
  private removeHandler(event: string, handler: EventHandler): void {
    return removeHandler.call(this, event, handler);
  }
  
  /**
   * Add event to history
   */
  private addToHistory(event: string, payload: EventPayload): void {
    return addToHistory.call(this, event, payload);
  }
  
  /**
   * Get event history
   */
  getHistory(event?: string): EventHistoryEntry[] {
    return getHistory.call(this, event);
  }
  
  /**
   * Clear event history
   */
  clearHistory(): void {
    return clearHistory.call(this);
  }
  
  /**
   * Reset the EventBus
   */
  reset(): void {
    return reset.call(this);
  }
}