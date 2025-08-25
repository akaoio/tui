/**
 * Add event to history (private method)
 */

import { EventPayload } from './types';

export function addToHistory(this: any, event: string, payload: EventPayload): void {
  this.eventHistory.push({ event, payload });
  
  // Trim history if needed
  if (this.eventHistory.length > this.maxHistory) {
    this.eventHistory = this.eventHistory.slice(-this.maxHistory);
  }
}