/**
 * Helper: Create standard navigation bindings method
 */

import { KeyBinding } from './types'

export function createNavigationBindings(this: any): KeyBinding[] {
  return [
    { key: 'up', handler: 'navigate:up', description: 'Move up' },
    { key: 'down', handler: 'navigate:down', description: 'Move down' },
    { key: 'left', handler: 'navigate:left', description: 'Move left' },
    { key: 'right', handler: 'navigate:right', description: 'Move right' },
    { key: 'tab', handler: 'navigate:next', description: 'Next field' },
    { key: 'tab', shift: true, handler: 'navigate:prev', description: 'Previous field' },
    { key: 'return', handler: 'navigate:select', description: 'Select/Submit' },
    { key: 'escape', handler: 'navigate:cancel', description: 'Cancel/Back' }
  ]
}