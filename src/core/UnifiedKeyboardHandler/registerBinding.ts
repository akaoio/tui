/**
 * Register a key binding method
 */

import { KeyBinding } from './types'

export function registerBinding(this: any, binding: KeyBinding, context: string = 'global'): void {
  if (context === 'global') {
    this.globalBindings.push(binding)
  } else {
    if (!this.bindings.has(context)) {
      this.bindings.set(context, [])
    }
    this.bindings.get(context)!.push(binding)
  }
}