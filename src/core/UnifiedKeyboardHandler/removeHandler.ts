/**
 * Remove a handler method
 */

import { EventHandler } from './types'

export function removeHandler(this: any, event: string, handler: EventHandler): void {
  if (this.handlers && this.handlers.has(event)) {
    this.handlers.get(event)!.delete(handler)
    if (this.handlers.get(event)!.size === 0) {
      this.handlers.delete(event)
    }
  }
}