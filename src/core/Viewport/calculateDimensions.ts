/**
 * Calculate responsive dimensions with constraints method
 */

import { Dimensions, LayoutConstraints } from './types'

export function calculateDimensions(this: any, preferredWidth?: number,
  preferredHeight?: number,
  constraints?: LayoutConstraints): Dimensions {
  let width = preferredWidth ?? this.dimensions.width
  let height = preferredHeight ?? this.dimensions.height
  
  // Apply constraints
  if (constraints) {
    if (constraints.minWidth) width = Math.max(width, constraints.minWidth)
    if (constraints.maxWidth) width = Math.min(width, constraints.maxWidth)
    if (constraints.minHeight) height = Math.max(height, constraints.minHeight)
    if (constraints.maxHeight) height = Math.min(height, constraints.maxHeight)
    
    // Apply aspect ratio
    if (constraints.aspectRatio) {
      const currentRatio = width / height
      if (currentRatio > constraints.aspectRatio) {
        // Too wide, adjust width
        width = height * constraints.aspectRatio
      } else {
        // Too tall, adjust height
        height = width / constraints.aspectRatio
      }
    }
  }
  
  // Ensure within viewport
  width = Math.min(width, this.dimensions.width)
  height = Math.min(height, this.dimensions.height)
  
  return { width: Math.floor(width), height: Math.floor(height) }
}