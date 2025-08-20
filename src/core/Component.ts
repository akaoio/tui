/**
 * Generic Component Base Class
 * Framework provides only the foundation - apps define their own components
 */

import { EventEmitter } from 'events'
import { ScreenManager, Region } from './ScreenManager'

export interface ComponentProps {
  [key: string]: any
}

export interface RenderContext {
  screen: ScreenManager
  region: Region
  focused?: boolean
  hovered?: boolean
  state?: any
}

/**
 * Generic base component - apps extend this
 */
export abstract class Component extends EventEmitter {
  public props: ComponentProps
  public children: Component[] = []
  public parent?: Component
  public id?: string
  public focusable: boolean = false
  public focused: boolean = false
  
  constructor(props: ComponentProps = {}) {
    super()
    this.props = props
    this.id = props.id
    this.focusable = props.focusable ?? false
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
    context.screen.write(text, context.region.x + x, context.region.y + y, style)
  }

  protected fillRegion(context: RenderContext, region: Region, char: string = ' ', style?: string): void {
    const absRegion = {
      x: context.region.x + region.x,
      y: context.region.y + region.y,
      width: region.width,
      height: region.height
    }
    context.screen.fillRegion(absRegion, char, style)
  }

  protected drawBox(context: RenderContext, region: Region, style: string = 'single'): void {
    context.screen.drawBox(
      context.region.x + region.x,
      context.region.y + region.y,
      region.width,
      region.height,
      style
    )
  }

  /**
   * Component tree management
   */
  addChild(child: Component): void {
    child.parent = this
    this.children.push(child)
  }

  removeChild(child: Component): void {
    const index = this.children.indexOf(child)
    if (index > -1) {
      this.children.splice(index, 1)
      child.parent = undefined
    }
  }

  /**
   * Find components
   */
  findById(id: string): Component | undefined {
    if (this.id === id) return this
    for (const child of this.children) {
      const found = child.findById(id)
      if (found) return found
    }
    return undefined
  }

  /**
   * Get all focusable components in tree
   */
  getFocusableComponents(): Component[] {
    const focusable: Component[] = []
    if (this.focusable) focusable.push(this)
    for (const child of this.children) {
      focusable.push(...child.getFocusableComponents())
    }
    return focusable
  }
}