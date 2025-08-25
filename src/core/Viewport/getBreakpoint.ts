/**
 * Get current breakpoint method
 */

import { Breakpoints } from './types'

export function getBreakpoint(this: any): keyof Breakpoints {
  const width = this.dimensions.width
  
  if (width >= this.breakpoints.xl) return 'xl'
  if (width >= this.breakpoints.lg) return 'lg'
  if (width >= this.breakpoints.md) return 'md'
  if (width >= this.breakpoints.sm) return 'sm'
  return 'xs'
}