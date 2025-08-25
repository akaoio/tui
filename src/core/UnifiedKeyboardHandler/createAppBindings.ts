/**
 * Helper: Create standard application bindings method
 */

import { KeyBinding } from './types'

export function createAppBindings(this: any): KeyBinding[] {
  return [
    { key: 'q', handler: 'app:quit', description: 'Quit application' },
    { key: 'c', ctrl: true, handler: 'app:quit', description: 'Quit application' },
    { key: 'r', ctrl: true, handler: 'app:refresh', description: 'Refresh screen' },
    { key: 'l', ctrl: true, handler: 'app:clear', description: 'Clear screen' },
    { key: 'h', handler: 'app:help', description: 'Show help' },
    { key: '?', handler: 'app:help', description: 'Show help' }
  ]
}