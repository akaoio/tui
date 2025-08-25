/**
 * Helper: Parse vim-style key notation method
 * Examples: "<C-x>" -> ctrl+x, "<S-Tab>" -> shift+tab, "<M-a>" -> meta+a
 */

import { KeyBinding } from './types'

export function parseKeyNotation(this: any, notation: string): Partial<KeyBinding> {
  let key = notation
  let ctrl = false
  let shift = false
  let meta = false
  let alt = false

  // Parse modifiers
  const modifierRegex = /<([CSMA])-(.+?)>/g
  let match
  
  while ((match = modifierRegex.exec(notation)) !== null) {
    const modifier = match[1]
    key = match[2].toLowerCase()
    
    switch (modifier) {
      case 'C': ctrl = true; break
      case 'S': shift = true; break
      case 'M': meta = true; break
      case 'A': alt = true; break
    }
  }

  // Handle special keys
  const specialKeys: Record<string, string> = {
    'cr': 'return',
    'esc': 'escape',
    'bs': 'backspace',
    'del': 'delete',
    'tab': 'tab',
    'space': 'space'
  }

  if (specialKeys[key]) {
    key = specialKeys[key]
  }

  return { key, ctrl, shift, meta, alt }
}