/**
 * UnifiedKeyboardHandler - Container class
 * Centralized keyboard event handling
 * 
 * Provides a unified approach to keyboard handling across both
 * component-based and schema-driven rendering systems.
 * Simplified version without EventBus dependency.
 */

import { EventEmitter } from 'events'
import { Keyboard, Key, KeyEvent } from '../keyboard'
import { KeyBinding, KeyboardContext, EventHandler } from './types'
import { constructor } from './constructor'
import { setupKeyboardListeners } from './setupKeyboardListeners'
import { handleKeyEvent } from './handleKeyEvent'
import { matchesBinding } from './matchesBinding'
import { executeBinding } from './executeBinding'
import { getHandlersForEvent } from './getHandlersForEvent'
import { removeHandler } from './removeHandler'
import { registerBinding } from './registerBinding'
import { registerBindings } from './registerBindings'
import { removeBinding } from './removeBinding'
import { clearBindings } from './clearBindings'
import { pushContext } from './pushContext'
import { popContext } from './popContext'
import { getCurrentContext } from './getCurrentContext'
import { setEnabled } from './setEnabled'
import { createNavigationBindings } from './createNavigationBindings'
import { createAppBindings } from './createAppBindings'
import { parseKeyNotation } from './parseKeyNotation'
import { destroy } from './destroy'

export class UnifiedKeyboardHandler extends EventEmitter {
  private keyboard!: Keyboard
  private bindings: Map<string, KeyBinding[]> = new Map()
  private globalBindings: KeyBinding[] = []
  private contextStack: string[] = ['global']
  private enabled = true

  constructor(keyboard: Keyboard) {
    super()
    constructor.call(this, keyboard)
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardListeners(): void {
    setupKeyboardListeners.call(this)
  }

  /**
   * Handle a keyboard event
   */
  private handleKeyEvent(key: Key | null, event: KeyEvent, char: string): void {
    handleKeyEvent.call(this, key, event, char)
  }

  /**
   * Check if a key event matches a binding
   */
  private matchesBinding(binding: KeyBinding, key: Key | null, event: KeyEvent, char: string): boolean {
    return matchesBinding.call(this, binding, key, event, char)
  }

  /**
   * Execute a key binding
   */
  private executeBinding(binding: KeyBinding, context: KeyboardContext): void {
    executeBinding.call(this, binding, context)
  }

  /**
   * Get handlers for an event
   */
  private getHandlersForEvent(event: string): Set<EventHandler> {
    return getHandlersForEvent.call(this, event)
  }

  /**
   * Remove a handler
   */
  private removeHandler(event: string, handler: EventHandler): void {
    removeHandler.call(this, event, handler)
  }

  /**
   * Register a key binding
   */
  registerBinding(binding: KeyBinding, context: string = 'global'): void {
    registerBinding.call(this, binding, context)
  }

  /**
   * Register multiple bindings
   */
  registerBindings(bindings: KeyBinding[], context: string = 'global'): void {
    registerBindings.call(this, bindings, context)
  }

  /**
   * Remove a key binding
   */
  removeBinding(key: string, context: string = 'global'): void {
    removeBinding.call(this, key, context)
  }

  /**
   * Clear all bindings for a context
   */
  clearBindings(context: string = 'global'): void {
    clearBindings.call(this, context)
  }

  /**
   * Push a new context onto the stack
   */
  pushContext(context: string): void {
    pushContext.call(this, context)
  }

  /**
   * Pop the current context from the stack
   */
  popContext(): string | undefined {
    return popContext.call(this)
  }

  /**
   * Get current context
   */
  getCurrentContext(): string {
    return getCurrentContext.call(this)
  }

  /**
   * Enable/disable keyboard handling
   */
  setEnabled(enabled: boolean): void {
    setEnabled.call(this, enabled)
  }

  /**
   * Helper: Create standard navigation bindings
   */
  static createNavigationBindings(): KeyBinding[] {
    return createNavigationBindings()
  }

  /**
   * Helper: Create standard application bindings
   */
  static createAppBindings(): KeyBinding[] {
    return createAppBindings()
  }

  /**
   * Helper: Parse vim-style key notation
   */
  static parseKeyNotation(notation: string): Partial<KeyBinding> {
    return parseKeyNotation(notation)
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    destroy.call(this)
  }
}

// Re-export types
export { KeyBinding, KeyboardContext } from './types'
export default UnifiedKeyboardHandler