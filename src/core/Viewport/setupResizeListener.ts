/**
 * Setup resize event listener method with robust signal handling
 */

import { getCurrentDimensions } from './getCurrentDimensions'

export function setupResizeListener(this: any): void {
  const handleResize = () => {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
    
    this.resizeTimeout = setTimeout(() => {
      const oldDimensions = { ...this.dimensions }
      this.dimensions = getCurrentDimensions.call(this)
      
      // Only emit if dimensions actually changed
      if (oldDimensions.width !== this.dimensions.width ||
          oldDimensions.height !== this.dimensions.height) {
        this.emit('resize', this.dimensions, oldDimensions)
        
        // Also emit specific events for easier handling
        if (oldDimensions.width !== this.dimensions.width) {
          this.emit('widthChange', this.dimensions.width, oldDimensions.width)
        }
        if (oldDimensions.height !== this.dimensions.height) {
          this.emit('heightChange', this.dimensions.height, oldDimensions.height)
        }
      }
    }, this.resizeDebounceMs)
  }
  
  // Method 1: stdout resize event (Node.js built-in)
  if (process.stdout.isTTY) {
    process.stdout.on('resize', handleResize)
  }
  
  // Method 2: SIGWINCH signal (Unix terminals)
  // This catches resize events that stdout might miss
  if (process.platform !== 'win32') {
    process.on('SIGWINCH', handleResize)
  }
  
  // Method 3: Windows SIGWINCH equivalent
  // Windows doesn't have SIGWINCH but we can poll for changes
  if (process.platform === 'win32' && process.stdout.isTTY) {
    // Set up polling for Windows terminals
    let lastWidth = this.dimensions.width
    let lastHeight = this.dimensions.height
    
    setInterval(() => {
      const current = getCurrentDimensions.call(this)
      if (current.width !== lastWidth || current.height !== lastHeight) {
        lastWidth = current.width
        lastHeight = current.height
        handleResize()
      }
    }, 1000) // Poll every second on Windows
  }
  
  // Store cleanup function for proper shutdown
  this._cleanupResize = () => {
    if (process.stdout.isTTY) {
      process.stdout.removeListener('resize', handleResize)
    }
    if (process.platform !== 'win32') {
      process.removeListener('SIGWINCH', handleResize)
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
  }
}