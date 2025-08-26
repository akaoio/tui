/**
 * Viewport - Container class
 * Viewport Management System
 * Handles terminal dimensions, responsive layouts, and auto-resizing
 */

import { EventEmitter } from 'events'
import { 
  Breakpoints, 
  DEFAULT_BREAKPOINTS, 
  LayoutConstraints, 
  ResponsiveValue, 
  Dimensions, 
  LayoutInfo 
} from './types'
import { constructor } from './constructor'
import { getInstance } from './getInstance'
import { getCurrentDimensions } from './getCurrentDimensions'
import { setupResizeListener } from './setupResizeListener'
import { getDimensions } from './getDimensions'
import { getBreakpoint } from './getBreakpoint'
import { getResponsiveValue } from './getResponsiveValue'
import { calculateDimensions } from './calculateDimensions'
import { detectTerminalCapabilities, TerminalCapabilities } from './detectTerminalCapabilities'

export class Viewport extends EventEmitter {
  private static instance: Viewport
  private dimensions!: Dimensions
  private breakpoints!: Breakpoints
  private resizeTimeout?: NodeJS.Timeout
  private resizeDebounceMs = 100
  private capabilities!: TerminalCapabilities
  private aspectRatio!: number
  private dimensionHistory!: Array<Dimensions & { timestamp: number }>
  private maxHistorySize!: number
  private _cleanupResize?: () => void
  
  private constructor() {
    super()
    constructor.call(this)
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): Viewport {
    return getInstance.call(Viewport)
  }
  
  /**
   * Get current terminal dimensions
   */
  private getCurrentDimensions(): Dimensions {
    return getCurrentDimensions.call(this)
  }
  
  /**
   * Setup resize event listener
   */
  private setupResizeListener(): void {
    setupResizeListener.call(this)
  }
  
  /**
   * Get current viewport dimensions
   */
  getDimensions(): Dimensions {
    return getDimensions.call(this)
  }
  
  /**
   * Get viewport width
   */
  getWidth(): number {
    return this.dimensions.width
  }
  
  /**
   * Get viewport height
   */
  getHeight(): number {
    return this.dimensions.height
  }
  
  /**
   * Get current breakpoint
   */
  getBreakpoint(): keyof Breakpoints {
    return getBreakpoint.call(this)
  }
  
  /**
   * Check if viewport matches breakpoint
   */
  matchesBreakpoint(breakpoint: keyof Breakpoints): boolean {
    const current = this.getBreakpoint()
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl']
    const currentIndex = breakpointOrder.indexOf(current)
    const targetIndex = breakpointOrder.indexOf(breakpoint)
    return currentIndex >= targetIndex
  }
  
  /**
   * Get responsive value based on current breakpoint
   */
  getResponsiveValue<T>(responsive: ResponsiveValue<T> | T): T {
    return getResponsiveValue.call(this, responsive) as T
  }
  
  /**
   * Get orientation
   */
  getOrientation(): 'portrait' | 'landscape' {
    return this.dimensions.height > this.dimensions.width ? 'portrait' : 'landscape'
  }
  
  /**
   * Calculate responsive dimensions with constraints
   */
  calculateDimensions(
    preferredWidth?: number,
    preferredHeight?: number,
    constraints?: LayoutConstraints
  ): Dimensions {
    return calculateDimensions.call(this, preferredWidth, preferredHeight, constraints)
  }
  
  /**
   * Get layout information
   */
  getLayoutInfo(): LayoutInfo {
    return {
      viewport: this.getDimensions(),
      availableSpace: this.getDimensions(), // Can be adjusted for margins
      breakpoint: this.getBreakpoint(),
      orientation: this.getOrientation(),
      scale: 1.0
    }
  }
  
  /**
   * Set custom breakpoints
   */
  setBreakpoints(breakpoints: Partial<Breakpoints>): void {
    this.breakpoints = { ...this.breakpoints, ...breakpoints }
    this.emit('breakpointsChanged', this.breakpoints)
  }
  
  /**
   * Add resize listener
   */
  onResize(callback: (dimensions: Dimensions, oldDimensions: Dimensions) => void): () => void {
    this.on('resize', callback)
    return () => this.off('resize', callback)
  }
  
  /**
   * Force update dimensions (useful for testing)
   */
  forceUpdate(): void {
    const oldDimensions = { ...this.dimensions }
    this.dimensions = this.getCurrentDimensions()
    if (oldDimensions.width !== this.dimensions.width ||
        oldDimensions.height !== this.dimensions.height) {
      this.emit('resize', this.dimensions, oldDimensions)
    }
  }
  
  /**
   * Calculate percentage-based width
   */
  percentWidth(percent: number): number {
    return Math.floor(this.dimensions.width * (percent / 100))
  }
  
  /**
   * Calculate percentage-based height
   */
  percentHeight(percent: number): number {
    return Math.floor(this.dimensions.height * (percent / 100))
  }
  
  /**
   * Calculate grid-based dimensions
   */
  grid(cols: number, rows: number): { colWidth: number; rowHeight: number } {
    return {
      colWidth: Math.floor(this.dimensions.width / cols),
      rowHeight: Math.floor(this.dimensions.height / rows)
    }
  }
  
  /**
   * Get terminal capabilities
   */
  getCapabilities(): TerminalCapabilities {
    return this.capabilities
  }
  
  /**
   * Check if terminal supports a specific feature
   */
  supports(feature: keyof TerminalCapabilities): boolean {
    return !!this.capabilities[feature]
  }
  
  /**
   * Get dimension history (useful for animations/transitions)
   */
  getDimensionHistory(): Array<Dimensions & { timestamp: number }> {
    return [...this.dimensionHistory]
  }
  
  /**
   * Get aspect ratio
   */
  getAspectRatio(): number {
    return this.aspectRatio
  }
  
  /**
   * Check if viewport is in portrait mode
   */
  isPortrait(): boolean {
    return this.dimensions.height > this.dimensions.width
  }
  
  /**
   * Check if viewport is in landscape mode
   */
  isLandscape(): boolean {
    return this.dimensions.width > this.dimensions.height
  }
  
  /**
   * Get safe area (accounting for terminal chrome/borders)
   */
  getSafeArea(padding: number = 1): Dimensions {
    return {
      width: Math.max(1, this.dimensions.width - (padding * 2)),
      height: Math.max(1, this.dimensions.height - (padding * 2))
    }
  }
  
  /**
   * Cleanup and destroy viewport instance
   */
  destroy(): void {
    if (this._cleanupResize) {
      this._cleanupResize()
    }
    this.removeAllListeners()
  }
}

// Re-export types
export { 
  Breakpoints, 
  DEFAULT_BREAKPOINTS, 
  LayoutConstraints, 
  ResponsiveValue, 
  Dimensions, 
  LayoutInfo 
} from './types'
export { TerminalCapabilities } from './detectTerminalCapabilities'
export default Viewport