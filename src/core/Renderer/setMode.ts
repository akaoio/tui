/**
 * Set render mode method
 */

import { RenderMode } from './types'

export function setMode(this: any, mode: RenderMode): void {
  this.mode = mode
}