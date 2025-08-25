/**
 * Check if in stream mode method
 */

import { RenderMode } from './types'

export function isStreamMode(this: any): boolean {
  return this.mode === RenderMode.STREAM || this.mode === RenderMode.AUTO
}