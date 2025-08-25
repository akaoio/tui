/**
 * Check if in absolute mode method
 */

import { RenderMode } from './types'

export function isAbsoluteMode(this: any): boolean {
  return this.mode === RenderMode.ABSOLUTE
}