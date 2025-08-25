/**
 * Render the entire app method
 */

import { RenderContext } from '../Component'

export function render(this: any): void {
  if (!this.rootComponent || !this.running) return

  const { width, height } = this.screen.getDimensions()
  
  // Only clear screen on first render, then use smart updates
  if (this.firstRender) {
    this.screen.clear()
    this.firstRender = false
  }

  const context: RenderContext = {
    screen: this.screen,
    region: { x: 0, y: 0, width, height },
    focused: false
  }

  // Let the root component render itself however it wants
  this.rootComponent.render(context)

  // Update cursor position if focused component has one
  const focused = this.focusManager.getFocused()
  if (focused) {
    const cursorPos = focused.getCursorPosition?.()
    if (cursorPos) {
      this.screen.setCursorPosition(cursorPos.x, cursorPos.y)
      this.screen.setCursorVisible(true)
    } else {
      this.screen.setCursorVisible(false)
    }
  }

  ;(this.screen as any).flush()
}