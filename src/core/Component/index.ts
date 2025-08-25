/**
 * Component - Container class
 * Generic base component - apps extend this
 */

import { EventEmitter } from 'events'
import { ComponentProps, RenderContext } from './types'
import { Region } from '../ScreenManager/index'
import { constructor } from './constructor'
import { writeText } from './writeText'
import { fillRegion } from './fillRegion'
import { drawBox } from './drawBox'
import { addChild } from './addChild'
import { removeChild } from './removeChild'
import { findById } from './findById'
import { getFocusableComponents } from './getFocusableComponents'

export abstract class Component extends EventEmitter {
  public props: ComponentProps = {}
  public children: Component[] = []
  public parent?: Component
  public id?: string
  public focusable: boolean = false
  public focused: boolean = false
  
  constructor(props: ComponentProps = {}) {
    super()
    constructor.call(this, props)
  }

  /**
   * Framework calls this - app implements how component renders
   */
  abstract render(context: RenderContext): void

  /**
   * Optional: Handle keyboard input
   */
  handleKeypress?(char: string, key: any): boolean

  /**
   * Optional: Handle mouse events  
   */
  handleMouse?(event: any): boolean

  /**
   * Optional: Get cursor position for text input
   */
  getCursorPosition?(): { x: number; y: number } | null

  /**
   * Framework helpers for common tasks
   */
  protected writeText(context: RenderContext, text: string, x: number, y: number, style?: string): void {
    writeText.call(this, context, text, x, y, style)
  }

  protected fillRegion(context: RenderContext, region: Region, char: string = ' ', style?: string): void {
    fillRegion.call(this, context, region, char, style)
  }

  protected drawBox(context: RenderContext, region: Region, style: string = 'single'): void {
    drawBox.call(this, context, region, style)
  }

  /**
   * Component tree management
   */
  addChild(child: Component): void {
    addChild.call(this, child)
  }

  removeChild(child: Component): void {
    removeChild.call(this, child)
  }

  /**
   * Find components
   */
  findById(id: string): Component | undefined {
    return findById.call(this, id)
  }

  /**
   * Get all focusable components in tree
   */
  getFocusableComponents(): Component[] {
    return getFocusableComponents.call(this)
  }
}

// Re-export types
export { ComponentProps, RenderContext } from './types'
export default Component