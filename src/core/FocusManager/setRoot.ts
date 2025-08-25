/**
 * Set root component method
 */

import { Component } from '../Component'
import { updateFocus } from './updateFocus'

export function setRoot(this: any, component: Component): void {
  this.root = component
  this.focusableComponents = component.getFocusableComponents()
  this.currentIndex = 0
  // Don't auto-focus when setting root - let the caller decide
}