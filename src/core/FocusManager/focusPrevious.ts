/**
 * Focus previous component method
 */

import { updateFocus } from './updateFocus'

export function focusPrevious(this: any): void {
  // Handle null root
  if (!this.root) {
    return
  }

  // Get focusable components from focus trap or root
  let focusableComponents = this.focusTrap 
    ? this.focusTrap.getFocusableComponents() 
    : this.root.getFocusableComponents()

  // Filter out disabled and invisible components
  focusableComponents = focusableComponents.filter((comp: any) => 
    !comp.disabled && comp.visible !== false && comp.tabIndex !== -1
  )

  // Sort by tabIndex if present
  focusableComponents.sort((a: any, b: any) => {
    const aTabIndex = a.tabIndex || 0
    const bTabIndex = b.tabIndex || 0
    return aTabIndex - bTabIndex
  })

  if (focusableComponents.length === 0) {
    this.focused = null
    return
  }

  // If no component is focused, focus the last one
  if (!this.focused) {
    this.updateFocus(focusableComponents[focusableComponents.length - 1])
    return
  }

  // Find current focus index
  const currentIndex = focusableComponents.indexOf(this.focused)
  
  // Move to previous component (wrap around if needed)
  const prevIndex = currentIndex >= 0 
    ? currentIndex === 0 ? focusableComponents.length - 1 : currentIndex - 1
    : focusableComponents.length - 1

  this.updateFocus(focusableComponents[prevIndex])
}