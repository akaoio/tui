/**
 * Update focus method
 */

export function updateFocus(this: any, component?: any): void {
  // If called without component parameter, use current index behavior (internal calls)
  if (component === undefined) {
    // Clear all focus
    this.focusableComponents.forEach((comp: any) => {
      if (comp.focusable) {
        comp.focused = false
      }
    })

    // Set current focus
    const focused = this.focusableComponents[this.currentIndex]
    if (focused) {
      focused.focused = true
      this.focused = focused
    } else {
      this.focused = null
    }
    return
  }

  // External API call with component parameter
  const previousFocused = this.focused

  // Blur the previously focused component
  if (previousFocused && typeof previousFocused.blur === 'function') {
    try {
      previousFocused.blur()
    } catch (error) {
      // Handle components that throw on blur
    }
  }

  // Update focus history if component has an id
  if (component && component.id) {
    this.focusHistory.push(component.id)
    
    // Limit focus history size to 50
    if (this.focusHistory.length > 50) {
      this.focusHistory.shift()
    }
  }

  // Set new focused component
  this.focused = component

  // Focus the new component
  if (component && typeof component.focus === 'function') {
    try {
      component.focus()
    } catch (error) {
      // Handle components that throw on focus
    }
  }
}