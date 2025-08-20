/**
 * Viewport Management System
 * Handles terminal dimensions, responsive layouts, and auto-resizing
 */

import { EventEmitter } from 'events'

/**
 * Breakpoint definitions (like CSS media queries)
 */
export interface Breakpoints {
    xs: number  // Extra small
    sm: number  // Small
    md: number  // Medium
    lg: number  // Large
    xl: number  // Extra large
}

/**
 * Default breakpoints based on terminal width
 */
export const DEFAULT_BREAKPOINTS: Breakpoints = {
    xs: 0,
    sm: 40,
    md: 80,
    lg: 120,
    xl: 160
}

/**
 * Layout constraints
 */
export interface LayoutConstraints {
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    aspectRatio?: number
}

/**
 * Responsive value that changes based on viewport size
 */
export interface ResponsiveValue<T> {
    xs?: T
    sm?: T
    md?: T
    lg?: T
    xl?: T
    default: T
}

/**
 * Viewport dimensions
 */
export interface Dimensions {
    width: number
    height: number
}

/**
 * Layout information
 */
export interface LayoutInfo {
    viewport: Dimensions
    availableSpace: Dimensions
    breakpoint: keyof Breakpoints
    orientation: 'portrait' | 'landscape'
    scale: number  // For future scaling support
}

/**
 * Viewport manager handles terminal dimensions and responsive behavior
 */
export class Viewport extends EventEmitter {
    private static instance: Viewport
    private dimensions: Dimensions
    private breakpoints: Breakpoints
    private resizeTimeout?: NodeJS.Timeout
    private resizeDebounceMs = 100
    
    private constructor() {
        super()
        this.breakpoints = DEFAULT_BREAKPOINTS
        this.dimensions = this.getCurrentDimensions()
        this.setupResizeListener()
    }
    
    /**
     * Get singleton instance
     */
    static getInstance(): Viewport {
        if (!Viewport.instance) {
            Viewport.instance = new Viewport()
        }
        return Viewport.instance
    }
    
    /**
     * Get current terminal dimensions
     */
    private getCurrentDimensions(): Dimensions {
        if (process.stdout.isTTY) {
            return {
                width: process.stdout.columns || 80,
                height: process.stdout.rows || 24
            }
        }
        // Default dimensions for non-TTY environments
        return { width: 80, height: 24 }
    }
    
    /**
     * Setup resize event listener
     */
    private setupResizeListener(): void {
        if (!process.stdout.isTTY) return
        
        process.stdout.on('resize', () => {
            // Debounce resize events
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout)
            }
            
            this.resizeTimeout = setTimeout(() => {
                const oldDimensions = { ...this.dimensions }
                this.dimensions = this.getCurrentDimensions()
                
                if (oldDimensions.width !== this.dimensions.width ||
                    oldDimensions.height !== this.dimensions.height) {
                    this.emit('resize', this.dimensions, oldDimensions)
                }
            }, this.resizeDebounceMs)
        })
    }
    
    /**
     * Get current viewport dimensions
     */
    getDimensions(): Dimensions {
        return { ...this.dimensions }
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
        const width = this.dimensions.width
        
        if (width >= this.breakpoints.xl) return 'xl'
        if (width >= this.breakpoints.lg) return 'lg'
        if (width >= this.breakpoints.md) return 'md'
        if (width >= this.breakpoints.sm) return 'sm'
        return 'xs'
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
        if (!this.isResponsiveValue(responsive)) {
            return responsive
        }
        
        const breakpoint = this.getBreakpoint()
        const breakpointOrder = ['xl', 'lg', 'md', 'sm', 'xs'] as const
        
        // Find first defined value from current breakpoint down
        const startIndex = breakpointOrder.indexOf(breakpoint)
        for (let i = startIndex; i < breakpointOrder.length; i++) {
            const bp = breakpointOrder[i]
            if (responsive[bp] !== undefined) {
                return responsive[bp]!
            }
        }
        
        return responsive.default
    }
    
    /**
     * Check if value is responsive
     */
    private isResponsiveValue<T>(value: any): value is ResponsiveValue<T> {
        return typeof value === 'object' && 
               value !== null && 
               'default' in value
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
        let width = preferredWidth ?? this.dimensions.width
        let height = preferredHeight ?? this.dimensions.height
        
        // Apply constraints
        if (constraints) {
            if (constraints.minWidth) width = Math.max(width, constraints.minWidth)
            if (constraints.maxWidth) width = Math.min(width, constraints.maxWidth)
            if (constraints.minHeight) height = Math.max(height, constraints.minHeight)
            if (constraints.maxHeight) height = Math.min(height, constraints.maxHeight)
            
            // Apply aspect ratio
            if (constraints.aspectRatio) {
                const currentRatio = width / height
                if (currentRatio > constraints.aspectRatio) {
                    // Too wide, adjust width
                    width = height * constraints.aspectRatio
                } else {
                    // Too tall, adjust height
                    height = width / constraints.aspectRatio
                }
            }
        }
        
        // Ensure within viewport
        width = Math.min(width, this.dimensions.width)
        height = Math.min(height, this.dimensions.height)
        
        return { width: Math.floor(width), height: Math.floor(height) }
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