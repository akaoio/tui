/**
 * Viewport types
 */

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