/**
 * Get event history method
 */

import { EventHistoryEntry } from './types';

export function getHistory(this: any, event?: string): EventHistoryEntry[] {
  if (event) {
    return this.eventHistory.filter((e: any) => e.event === event);
  }
  return [...this.eventHistory];
}