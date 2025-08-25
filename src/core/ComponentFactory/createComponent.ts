/**
 * Create a basic placeholder component method
 */

import { PlaceholderComponent } from '../PlaceholderComponent/index'

export function createComponent(this: any, type: string, options: any): any {
  return new PlaceholderComponent({ type, ...options })
}