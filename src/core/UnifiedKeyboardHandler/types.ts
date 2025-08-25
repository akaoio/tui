/**
 * UnifiedKeyboardHandler types
 */

import { Keyboard, Key, KeyEvent } from '../keyboard'

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: string | Function;
  description?: string;
}

export interface KeyboardContext {
  preventDefault: () => void;
  stopPropagation: () => void;
  event: KeyEvent;
  char: string;
}

export interface EventHandler {
  id: string;
  handler: (payload: any) => void | boolean;
  priority?: number;
  once?: boolean;
  filter?: (payload: any) => boolean;
}