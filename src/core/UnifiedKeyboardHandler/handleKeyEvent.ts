/**
 * Handle a keyboard event method
 */

import { Key, KeyEvent } from '../keyboard'
import { KeyboardContext } from './types'
import { getHandlersForEvent } from './getHandlersForEvent'
import { matchesBinding } from './matchesBinding'
import { executeBinding } from './executeBinding'
import { removeHandler } from './removeHandler'

export function handleKeyEvent(this: any, key: Key | null, event: KeyEvent, char: string): void {
  const context: KeyboardContext = {
    preventDefault: () => { /* noop */ },
    stopPropagation: () => { /* noop */ },
    event,
    char
  }

  let handled = false
  let shouldPropagate = true

  // Override prevention/propagation
  context.preventDefault = () => { handled = true }
  context.stopPropagation = () => { shouldPropagate = false }

  // Check context-specific bindings (in reverse order - most specific first)
  for (let i = this.contextStack.length - 1; i >= 0 && shouldPropagate; i--) {
    const contextName = this.contextStack[i]
    const contextBindings = this.bindings.get(contextName) || []
    
    for (const binding of contextBindings) {
      if (matchesBinding.call(this, binding, key, event, char)) {
        executeBinding.call(this, binding, context)
        if (!shouldPropagate) break
      }
    }
  }

  // Check global bindings if not handled
  if (!handled && shouldPropagate) {
    for (const binding of this.globalBindings) {
      if (matchesBinding.call(this, binding, key, event, char)) {
        executeBinding.call(this, binding, context)
        if (!shouldPropagate) break
      }
    }
  }

  // Emit unhandled key events
  if (!handled) {
    this.emit('keyboard:unhandled', {
      key: key || char,
      event,
      char
    })
  }
}