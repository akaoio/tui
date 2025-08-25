/**
 * Setup resize event listener method
 */

import { getCurrentDimensions } from './getCurrentDimensions'

export function setupResizeListener(this: any): void {
  if (!process.stdout.isTTY) return
  
  process.stdout.on('resize', () => {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    
    this.resizeTimeout = setTimeout(() => {
      const oldDimensions = { ...this.dimensions }
      this.dimensions = getCurrentDimensions.call(this)
      
      if (oldDimensions.width !== this.dimensions.width ||
          oldDimensions.height !== this.dimensions.height) {
        this.emit('resize', this.dimensions, oldDimensions)
      }
    }, this.resizeDebounceMs)
  })
}