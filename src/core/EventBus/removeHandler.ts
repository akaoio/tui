/**
 * Remove a handler (private method)
 */

import { EventHandler } from './types';

export function removeHandler(this: any, event: string, handler: EventHandler): void {
  if (this.handlers.has(event)) {
    this.handlers.get(event)!.delete(handler);
    if (this.handlers.get(event)!.size === 0) {
      this.handlers.delete(event);
    }
  }
}