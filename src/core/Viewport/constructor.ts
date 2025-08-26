/**
 * Viewport constructor method with enhanced initialization
 */

import { DEFAULT_BREAKPOINTS } from './types'
import { getCurrentDimensions } from './getCurrentDimensions'
import { setupResizeListener } from './setupResizeListener'
import { detectTerminalCapabilities } from './detectTerminalCapabilities'

export function constructor(this: any): any {
  // Initialize with smart breakpoints based on terminal capabilities
  this.breakpoints = DEFAULT_BREAKPOINTS
  
  // Detect and store terminal capabilities
  this.capabilities = detectTerminalCapabilities()
  
  // Get initial dimensions with all detection methods
  this.dimensions = getCurrentDimensions.call(this)
  
  // Adjust debounce based on terminal capabilities
  // Faster for local terminals, slower for SSH or multiplexers
  if (this.capabilities.isSSH || this.capabilities.isTmux || this.capabilities.isScreen) {
    this.resizeDebounceMs = 200 // Slower debounce for remote/multiplexed sessions
  } else {
    this.resizeDebounceMs = 50 // Faster for local terminals
  }
  
  // Store initial aspect ratio for responsive calculations
  this.aspectRatio = this.dimensions.width / this.dimensions.height
  
  // Track dimension history for smooth transitions
  this.dimensionHistory = [{ ...this.dimensions, timestamp: Date.now() }]
  this.maxHistorySize = 10
  
  // Setup resize listener with enhanced detection
  setupResizeListener.call(this)
  
  // Log initialization in debug mode
  if (process.env.DEBUG?.includes('tui')) {
    console.log('[Viewport] Initialized with:', {
      dimensions: this.dimensions,
      capabilities: this.capabilities,
      debounceMs: this.resizeDebounceMs
    })
  }
}