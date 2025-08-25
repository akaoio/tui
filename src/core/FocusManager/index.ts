/**
 * FocusManager - Container class
 * Focus Management - Framework responsibility
 */

import { constructor } from './constructor'
import { setRoot } from './setRoot'
import { focusNext } from './focusNext'
import { focusPrevious } from './focusPrevious'
import { getFocused } from './getFocused'
import { updateFocus } from './updateFocus'
import { Component } from '../Component'

export class FocusManager {
  public focusableComponents: Component[] = []
  public currentIndex: number = 0
  public root: Component | null = null
  public focused: Component | null = null
  public focusTrap: Component | null = null
  public focusHistory: string[] = []

  constructor() {
    constructor.call(this)
  }

  setRoot(component: Component): void {
    return setRoot.call(this, component)
  }

  focusNext(): void {
    return focusNext.call(this)
  }

  focusPrevious(): void {
    return focusPrevious.call(this)
  }

  getFocused(): Component | null {
    return getFocused.call(this)
  }

  updateFocus(component?: Component | null): void {
    return updateFocus.call(this, component)
  }

  setFocusTrap(component: Component | null): void {
    this.focusTrap = component
  }

  releaseFocusTrap(): void {
    this.focusTrap = null
  }

  getFocusHistory(): string[] {
    return [...this.focusHistory]
  }

  restorePreviousFocus(): void {
    if (this.focusHistory.length >= 2 && this.root) {
      // Get the previous component (second to last in history)
      const previousId = this.focusHistory[this.focusHistory.length - 2]
      const previousComponent = this.root.findById(previousId)
      if (previousComponent) {
        this.updateFocus(previousComponent)
      }
    }
  }
}

export default FocusManager