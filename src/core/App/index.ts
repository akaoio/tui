/**
 * App - Container class
 * Generic TUI Application Framework
 * Pure framework - không biết gì về app-specific layout/styling
 */

import { EventEmitter } from 'events'
import { ScreenManager } from '../ScreenManager/index'
import { Component, RenderContext } from '../Component'
import { FocusManager } from '../FocusManager/index'
import { constructor } from './constructor'
import { setRootComponent } from './setRootComponent'
import { start } from './start'
import { stop } from './stop'
import { render } from './render'
import { setupEventHandlers } from './setupEventHandlers'
import { findComponentAt } from './findComponentAt'
import { getFocusManager } from './getFocusManager'

export class App extends EventEmitter {
  private screen!: ScreenManager
  private rootComponent?: Component
  private focusManager!: FocusManager
  private running = false
  private firstRender = true

  constructor() {
    super()
    constructor.call(this)
  }

  /**
   * Set root component - app decides what goes here
   */
  setRootComponent(component: Component): void {
    return setRootComponent.call(this, component)
  }

  /**
   * Start the app
   */
  async start(): Promise<void> {
    return start.call(this)
  }

  /**
   * Stop the app
   */
  stop(): void {
    return stop.call(this)
  }

  /**
   * Render the entire app
   */
  render(): void {
    return render.call(this)
  }

  private setupEventHandlers(): void {
    return setupEventHandlers.call(this)
  }

  /**
   * Find component at specific coordinates
   */
  private findComponentAt(component: Component, x: number, y: number): Component | null {
    return findComponentAt.call(this, component, x, y)
  }

  /**
   * Get the focus manager
   */
  getFocusManager(): FocusManager {
    return getFocusManager.call(this)
  }
}

export default App