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

export class Viewport extends EventEmitter {
  private static instance: Viewport
  private dimensions!: Dimensions
  private breakpoints!: Breakpoints
  private resizeTimeout?: NodeJS.Timeout
  private resizeDebounceMs = 100
  
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
export default Viewport