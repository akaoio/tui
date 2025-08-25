/**
 * Get current viewport dimensions method
 */

import { Dimensions } from './types'

export function getDimensions(this: any): Dimensions {
  return { ...this.dimensions }
}