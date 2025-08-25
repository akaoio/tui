/**
 * Setup keyboard event listeners method
 */

import { Key, KeyEvent } from '../keyboard'
import { handleKeyEvent } from './handleKeyEvent'

export function setupKeyboardListeners(this: any): void {
  // Listen for key events
  this.keyboard.on('key', (key: Key, event: KeyEvent) => {
    if (!this.enabled) return
    handleKeyEvent.call(this, key, event, '')
  })

  // Listen for character input
  this.keyboard.on('char', (char: string, event: KeyEvent) => {
    if (!this.enabled) return
    handleKeyEvent.call(this, null, event, char)
  })
}