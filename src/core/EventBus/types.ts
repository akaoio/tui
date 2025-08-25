/**
 * Types and interfaces for EventBus
 */

/**
 * Event payload
 */
export interface EventPayload {
  source?: string; // Component ID that triggered the event
  target?: string; // Target component ID (optional)
  data?: any;
  timestamp: Date;
  bubbles?: boolean; // Whether event should bubble up the component tree
  cancelable?: boolean; // Whether event can be cancelled
}

/**
 * Event handler with priority
 */
export interface EventHandler {
  id: string;
  handler: (payload: EventPayload) => void | boolean;
  priority?: number; // Lower number = higher priority
  once?: boolean;
  filter?: (payload: EventPayload) => boolean;
}

/**
 * Event subscription
 */
export interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * Event history entry
 */
export interface EventHistoryEntry {
  event: string;
  payload: EventPayload;
}