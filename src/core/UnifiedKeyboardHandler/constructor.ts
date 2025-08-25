/**
 * UnifiedKeyboardHandler constructor method
 */

import { Keyboard } from '../keyboard'
import { setupKeyboardListeners } from './setupKeyboardListeners'

export function constructor(this: any, keyboard: Keyboard): any {
  this.keyboard = keyboard
  this.bindings = new Map()
  this.globalBindings = []
  this.contextStack = ['global']
  this.enabled = true
  
  this.setMaxListeners(0) // Unlimited listeners
  setupKeyboardListeners.call(this)
}