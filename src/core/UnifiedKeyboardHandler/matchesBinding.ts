/**
 * Check if a key event matches a binding method
 */

import { KeyBinding } from './types'
import { Key, KeyEvent } from '../keyboard'

export function matchesBinding(this: any, binding: KeyBinding, key: Key | null, event: KeyEvent, char: string): boolean {
  // Check modifiers
  if (binding.ctrl !== undefined && binding.ctrl !== event.ctrl) return false
  if (binding.alt !== undefined && binding.alt !== event.meta) return false
  if (binding.shift !== undefined && binding.shift !== event.shift) return false
  if (binding.meta !== undefined && binding.meta !== event.meta) return false

  // Check key
  const eventKey = key || event.name || char
  return binding.key === eventKey
}