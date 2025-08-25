/**
 * FocusManager constructor method
 */

export function constructor(this: any): any {
  this.focusableComponents = []
  this.currentIndex = 0
  this.root = null
  this.focused = null
  this.focusTrap = null
  this.focusHistory = []
}