/**
 * Track current line in stream mode method
 */

import { isStreamMode } from './isStreamMode'

export function trackLine(this: any): void {
  if (isStreamMode.call(this)) {
    this.currentLine++
  }
}