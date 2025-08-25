/**
 * Viewport constructor method
 */

import { DEFAULT_BREAKPOINTS } from './types'
import { getCurrentDimensions } from './getCurrentDimensions'
import { setupResizeListener } from './setupResizeListener'

export function constructor(this: any): any {
  this.breakpoints = DEFAULT_BREAKPOINTS
  this.dimensions = getCurrentDimensions.call(this)
  this.resizeDebounceMs = 100
  
  setupResizeListener.call(this)
}