/**
 * Renderer constructor method
 */

import { RenderMode } from './types'

export function constructor(this: any, mode: RenderMode = RenderMode.STREAM) {
  this.mode = mode
  this.currentLine = 0
}