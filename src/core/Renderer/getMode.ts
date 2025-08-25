/**
 * Get current render mode method
 */

import { RenderMode } from './types'

export function getMode(this: any): RenderMode {
  return this.mode
}