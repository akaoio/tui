/**
 * Setup event handlers method
 */

import { render } from './render'
import { findComponentAt } from './findComponentAt'

export function setupEventHandlers(this: any): void {
  // Global keyboard handling
  this.screen.on('keypress', (char: string, key: any) => {
    // Framework provides basic navigation
    if (key?.name === 'tab') {
      if (key.shift) {
        this.focusManager.focusPrevious()
      } else {
        this.focusManager.focusNext()
      }
      render.call(this)
      return
    }

    // Ctrl+K cursor mode is handled by ScreenManager
    if (key?.ctrl && key?.name === 'k') {
      setTimeout(() => render.call(this), 10)
      return
    }

    // Send to focused component first
    const focused = this.focusManager.getFocused()
    if (focused?.handleKeypress) {
      if (focused.handleKeypress(char, key)) {
        render.call(this)
        return
      }
    }

    // Emit to app level
    this.emit('keypress', char, key)
  })

  // Mouse handling
  this.screen.on('mouse', (event: any) => {
    // Find component at mouse position and send event
    if (this.rootComponent) {
      const component = findComponentAt.call(this, this.rootComponent, event.x, event.y)
      if (component?.handleMouse) {
        if (component.handleMouse(event)) {
          render.call(this)
          return
        }
      }
    }

    this.emit('mouse', event)
  })

  // Resize handling
  this.screen.on('resize', () => {
    render.call(this)
  })
}