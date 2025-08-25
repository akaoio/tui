/**
 * Get responsive value based on current breakpoint method
 */

import { ResponsiveValue } from './types'
import { getBreakpoint } from './getBreakpoint'

export function getResponsiveValue<T>(this: any, responsive: ResponsiveValue<T> | T): T {
  if (!isResponsiveValue(responsive)) {
    return responsive
  }
  
  const breakpoint = getBreakpoint.call(this)
  const breakpointOrder = ['xl', 'lg', 'md', 'sm', 'xs'] as const
  
  // Find first defined value from current breakpoint down
  const startIndex = breakpointOrder.indexOf(breakpoint)
  for (let i = startIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (responsive[bp] !== undefined) {
      return responsive[bp]!
    }
  }
  
  return responsive.default
}

/**
 * Check if value is responsive
 */
function isResponsiveValue<T>(value: any): value is ResponsiveValue<T> {
  return typeof value === 'object' && 
         value !== null && 
         'default' in value
}