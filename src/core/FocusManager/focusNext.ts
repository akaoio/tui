/**
 * Focus next component method
 */

import { updateFocus } from './updateFocus'

export function focusNext(this: any): void {
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

  // If no component is focused, focus the first one
  if (!this.focused) {
    this.updateFocus(focusableComponents[0])
    return
  }

  // Find current focus index
  const currentIndex = focusableComponents.indexOf(this.focused)
  
  // Move to next component (wrap around if needed)
  const nextIndex = currentIndex >= 0 
    ? (currentIndex + 1) % focusableComponents.length
    : 0

  this.updateFocus(focusableComponents[nextIndex])
}