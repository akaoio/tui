/**
 * Virtual Cursor System
 * Provides a visual cursor that doesn't interfere with rendering
 */

import { EventEmitter } from 'events'
import { ScreenManager } from './ScreenManager'

export interface CursorPosition {
  x: number
  y: number
}

export class VirtualCursor extends EventEmitter {
  private position: CursorPosition = { x: 0, y: 0 }
  private visible: boolean = false
  private bounds: { width: number; height: number }
  private cursorChar: string = '█'
  private cursorStyle: string = '\x1b[93m' // Bright yellow
  private savedChar: string = ' '
  private savedStyle: string = ''
  private blinkInterval: NodeJS.Timeout | null = null
  private blinkState: boolean = true

  constructor(private screen: ScreenManager) {
    super()
    const dimensions = screen.getDimensions()
    this.bounds = { width: dimensions.width, height: dimensions.height }
    
    // Listen for screen resize
    screen.on('resize', () => {
      const dimensions = screen.getDimensions()
      this.bounds = { width: dimensions.width, height: dimensions.height }
      this.constrainPosition()
    })
  }

  /**
   * Show the virtual cursor
   */
  show(): void {
    if (this.visible) return
    
    this.visible = true
    this.startBlinking()
    this.render()
    this.emit('show')
  }

  /**
   * Hide the virtual cursor
   */
  hide(): void {
    if (!this.visible) return
    
    this.visible = false
    this.stopBlinking()
    this.restore()
    this.emit('hide')
  }

  /**
   * Toggle cursor visibility
   */
  toggle(): void {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * Move cursor to absolute position
   */
  moveTo(x: number, y: number): void {
    if (!this.visible) return
    
    // Restore previous position
    this.restore()
    
    // Update position
    this.position.x = x
    this.position.y = y
    this.constrainPosition()
    
    // Render at new position
    this.render()
    
    this.emit('move', this.position)
  }

  /**
   * Move cursor relatively
   */
  move(dx: number, dy: number): void {
    this.moveTo(this.position.x + dx, this.position.y + dy)
  }

  /**
   * Move cursor with arrow keys
   */
  moveUp(): void { this.move(0, -1) }
  moveDown(): void { this.move(0, 1) }
  moveLeft(): void { this.move(-1, 0) }
  moveRight(): void { this.move(1, 0) }

  /**
   * Get current position
   */
  getPosition(): CursorPosition {
    return { ...this.position }
  }

  /**
   * Set cursor character
   */
  setCursorChar(char: string): void {
    this.cursorChar = char
    if (this.visible) {
      this.render()
    }
  }

  /**
   * Set cursor style (ANSI color code)
   */
  setCursorStyle(style: string): void {
    this.cursorStyle = style
    if (this.visible) {
      this.render()
    }
  }

  /**
   * Handle keyboard input for cursor movement
   */
  handleInput(char: string, key: any): boolean {
    if (!this.visible) return false
    
    // Arrow keys
    if (key?.name === 'up' || char === 'w') {
      this.moveUp()
      return true
    }
    if (key?.name === 'down' || char === 's') {
      this.moveDown()
      return true
    }
    if (key?.name === 'left' || char === 'a') {
      this.moveLeft()
      return true
    }
    if (key?.name === 'right' || char === 'd') {
      this.moveRight()
      return true
    }
    
    // Space or Enter to "click"
    if (char === ' ' || key?.name === 'return' || key?.name === 'enter') {
      this.emit('click', this.position)
      return true
    }
    
    return false
  }

  /**
   * Check if position is at specific coordinates
   */
  isAt(x: number, y: number): boolean {
    return this.position.x === x && this.position.y === y
  }

  /**
   * Check if position is within a region
   */
  isInRegion(x: number, y: number, width: number, height: number): boolean {
    return this.position.x >= x && 
           this.position.x < x + width &&
           this.position.y >= y && 
           this.position.y < y + height
  }

  /**
   * Get the component at cursor position
   */
  getComponentAt(): string | null {
    // This would integrate with component registry
    // For now, emit event for app to handle
    this.emit('query', this.position)
    return null
  }

  private constrainPosition(): void {
    this.position.x = Math.max(0, Math.min(this.bounds.width - 1, this.position.x))
    this.position.y = Math.max(0, Math.min(this.bounds.height - 1, this.position.y))
  }

  private render(): void {
    if (!this.visible || !this.blinkState) return
    
    // Save what's under the cursor
    // Note: In real implementation, we'd read from screen buffer
    this.savedChar = ' '
    this.savedStyle = ''
    
    // Draw cursor
    this.screen.write(
      this.cursorChar,
      this.position.x,
      this.position.y,
      this.cursorStyle
    )
    
    // Force flush to ensure cursor is visible
    ;(this.screen as any).flush()
  }

  private restore(): void {
    // Restore what was under the cursor
    this.screen.write(
      this.savedChar,
      this.position.x,
      this.position.y,
      this.savedStyle
    )
  }

  private startBlinking(): void {
    if (this.blinkInterval) return
    
    this.blinkInterval = setInterval(() => {
      this.blinkState = !this.blinkState
      
      if (this.blinkState) {
        this.render()
      } else {
        this.restore()
      }
    }, 500) // Blink every 500ms
  }

  private stopBlinking(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval)
      this.blinkInterval = null
    }
    this.blinkState = true
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.hide()
    this.removeAllListeners()
  }
}

/**
 * Virtual Cursor Manager - Singleton
 */
export class VirtualCursorManager {
  private static instance: VirtualCursorManager
  private cursor: VirtualCursor | null = null
  private enabled: boolean = false

  private constructor() {}

  static getInstance(): VirtualCursorManager {
    if (!VirtualCursorManager.instance) {
      VirtualCursorManager.instance = new VirtualCursorManager()
    }
    return VirtualCursorManager.instance
  }

  initialize(screen: ScreenManager): VirtualCursor {
    if (!this.cursor) {
      this.cursor = new VirtualCursor(screen)
      
      // Hide real cursor when virtual cursor is active
      this.cursor.on('show', () => {
        screen.setCursorVisible(false)
      })
      
      this.cursor.on('hide', () => {
        // Don't restore real cursor automatically
        // Let app decide
      })
    }
    return this.cursor
  }

  getCursor(): VirtualCursor | null {
    return this.cursor
  }

  enable(): void {
    if (!this.cursor) {
      throw new Error('Virtual cursor not initialized. Call initialize() first.')
    }
    this.enabled = true
    this.cursor.show()
  }

  disable(): void {
    if (this.cursor) {
      this.enabled = false
      this.cursor.hide()
    }
  }

  toggle(): void {
    if (this.enabled) {
      this.disable()
    } else {
      this.enable()
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  handleInput(char: string, key: any): boolean {
    if (!this.enabled || !this.cursor) return false
    return this.cursor.handleInput(char, key)
  }
}