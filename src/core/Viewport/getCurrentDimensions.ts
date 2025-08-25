/**
 * Get current terminal dimensions method
 */

import { Dimensions } from './types'

export function getCurrentDimensions(this: any): Dimensions {
  if (process.stdout.isTTY) {
    return {
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24
    }
  }
  // Default dimensions for non-TTY environments
  return { width: 80, height: 24 }
}