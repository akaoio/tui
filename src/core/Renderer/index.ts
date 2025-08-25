/**
 * Renderer - Container class
 * Renderer that handles both stream and absolute positioning
 */

import { RenderMode, Position } from './types'
import { constructor } from './constructor'
import { getMode } from './getMode'
import { setMode } from './setMode'
import { isStreamMode } from './isStreamMode'
import { isAbsoluteMode } from './isAbsoluteMode'
import { trackLine } from './trackLine'
import { getCurrentLine } from './getCurrentLine'
import { resetTracking } from './resetTracking'

export class Renderer {
  private mode: RenderMode = RenderMode.STREAM
  private currentLine: number = 0
  
  constructor(mode: RenderMode = RenderMode.STREAM) {
    constructor.call(this, mode)
  }
  
  /**
   * Get current render mode
   */
  getMode(): RenderMode {
    return getMode.call(this)
  }
  
  /**
   * Set render mode
   */
  setMode(mode: RenderMode): void {
    setMode.call(this, mode)
  }
  
  /**
   * Check if in stream mode
   */
  isStreamMode(): boolean {
    return isStreamMode.call(this)
  }
  
  /**
   * Check if in absolute mode
   */
  isAbsoluteMode(): boolean {
    return isAbsoluteMode.call(this)
  }
  
  /**
   * Track current line in stream mode
   */
  trackLine(): void {
    trackLine.call(this)
  }
  
  /**
   * Get current line for stream mode
   */
  getCurrentLine(): number {
    return getCurrentLine.call(this)
  }
  
  /**
   * Reset line tracking
   */
  resetTracking(): void {
    resetTracking.call(this)
  }
}

// Re-export types
export { RenderMode, Position } from './types'
export default Renderer