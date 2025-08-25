/**
 * Register multiple bindings method
 */

import { KeyBinding } from './types'
import { registerBinding } from './registerBinding'

export function registerBindings(this: any, bindings: KeyBinding[], context: string = 'global'): void {
  for (const binding of bindings) {
    registerBinding.call(this, binding, context)
  }
}