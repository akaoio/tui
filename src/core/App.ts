/**
 * Generic TUI Application Framework
 * Pure framework - không biết gì về app-specific layout/styling
 */

import { EventEmitter } from 'events'
import { ScreenManager } from './ScreenManager'
import { Component, RenderContext } from './Component'

export class App extends EventEmitter {
  private screen: ScreenManager
  private rootComponent?: Component
  private focusManager: FocusManager
  private running = false
  private firstRender = true

  constructor() {
    super()
    this.screen = ScreenManager.getInstance()
    this.focusManager = new FocusManager()
    this.setupEventHandlers()
  }

  /**
   * Set root component - app decides what goes here
   */
  setRootComponent(component: Component): void {
    this.rootComponent = component
    this.focusManager.setRoot(component)
  }

  /**
   * Start the app
   */
  async start(): Promise<void> {
    if (this.running) return
    
    this.running = true
    this.screen.enterAlternateScreen()
    this.screen.enableMouse()
    this.render()
  }

  /**
   * Stop the app
   */
  stop(): void {
    if (!this.running) return
    
    this.running = false
    this.screen.cleanup()
    this.emit('stop')
  }

  /**
   * Render the entire app
   */
  render(): void {
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

  private setupEventHandlers(): void {
    // Global keyboard handling
    this.screen.on('keypress', (char: string, key: any) => {
      // Framework provides basic navigation
      if (key?.name === 'tab') {
        if (key.shift) {
          this.focusManager.focusPrevious()
        } else {
          this.focusManager.focusNext()
        }
        this.render()
        return
      }

      // Ctrl+K cursor mode is handled by ScreenManager
      if (key?.ctrl && key?.name === 'k') {
        setTimeout(() => this.render(), 10)
        return
      }

      // Send to focused component first
      const focused = this.focusManager.getFocused()
      if (focused?.handleKeypress) {
        if (focused.handleKeypress(char, key)) {
          this.render()
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
        const component = this.findComponentAt(this.rootComponent, event.x, event.y)
        if (component?.handleMouse) {
          if (component.handleMouse(event)) {
            this.render()
            return
          }
        }
      }

      this.emit('mouse', event)
    })

    // Resize handling
    this.screen.on('resize', () => {
      this.render()
    })
  }

  /**
   * Find component at specific coordinates
   */
  private findComponentAt(component: Component, x: number, y: number): Component | null {
    // This is framework logic - apps define their own hit testing
    // For now, just return the component
    return component
  }

  /**
   * Get the focus manager
   */
  getFocusManager(): FocusManager {
    return this.focusManager
  }
}

/**
 * Focus Management - Framework responsibility
 */
export class FocusManager {
  private focusableComponents: Component[] = []
  private currentIndex = 0

  setRoot(component: Component): void {
    this.focusableComponents = component.getFocusableComponents()
    this.currentIndex = 0
    this.updateFocus()
  }

  focusNext(): void {
    if (this.focusableComponents.length === 0) return
    
    this.currentIndex = (this.currentIndex + 1) % this.focusableComponents.length
    this.updateFocus()
  }

  focusPrevious(): void {
    if (this.focusableComponents.length === 0) return
    
    this.currentIndex = this.currentIndex === 0 
      ? this.focusableComponents.length - 1 
      : this.currentIndex - 1
    this.updateFocus()
  }

  getFocused(): Component | undefined {
    return this.focusableComponents[this.currentIndex]
  }

  private updateFocus(): void {
    // Clear all focus
    this.focusableComponents.forEach(comp => {
      if (comp.focusable) {
        (comp as any).focused = false
      }
    })

    // Set current focus
    const focused = this.getFocused()
    if (focused) {
      (focused as any).focused = true
    }
  }
}