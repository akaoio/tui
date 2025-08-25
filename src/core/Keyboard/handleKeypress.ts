import * as readline from 'readline';
import { Key, KeyEvent } from './types';
import { stop } from './stop';

/**
 * Handle keypress events
 */
export function handleKeypress(this: any, str: string, key: readline.Key): void {
  if (!key) return;

  const keyEvent: KeyEvent = {
    name: key.name || '',
    key: str || '',
    ctrl: key.ctrl || false,
    meta: key.meta || false,
    shift: key.shift || false,
    sequence: key.sequence || '',
  };

  if (key.ctrl && key.name === 'c') {
    this.emit('key', Key.CTRL_C, keyEvent);
    stop.call(this);
    process.exit(0);
  }

  const keyMap: { [key: string]: Key } = {
    up: Key.UP,
    down: Key.DOWN,
    left: Key.LEFT,
    right: Key.RIGHT,
    return: Key.ENTER,
    escape: Key.ESCAPE,
    space: Key.SPACE,
    tab: Key.TAB,
    backspace: Key.BACKSPACE,
    delete: Key.DELETE,
    home: Key.HOME,
    end: Key.END,
    pageup: Key.PAGEUP,
    pagedown: Key.PAGEDOWN,
  };

  const mappedKey = keyMap[key.name || ''];
  if (mappedKey) {
    this.emit('key', mappedKey, keyEvent);
  } else if (str) {
    this.emit('char', str, keyEvent);
  }

  this.emit('keypress', keyEvent);
}