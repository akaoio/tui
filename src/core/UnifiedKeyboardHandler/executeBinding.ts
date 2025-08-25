/**
 * Execute a key binding method
 */

import { KeyBinding, KeyboardContext } from './types'

export function executeBinding(this: any, binding: KeyBinding, context: KeyboardContext): void {
  if (typeof binding.handler === 'function') {
    // Direct function handler
    binding.handler(context)
  } else if (typeof binding.handler === 'string') {
    // Emit event with handler name
    this.emit(`keyboard:action:${binding.handler}`, context)
    this.emit('keyboard:action', {
      action: binding.handler,
      context
    })
  }
}