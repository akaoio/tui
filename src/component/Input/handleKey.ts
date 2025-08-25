/**
 * Input handleKey method
 */

import { Key, KeyEvent } from '../../core/keyboard';
import {
  moveCursorLeft,
  moveCursorRight,
  moveCursorUp,
  moveCursorDown,
  moveCursorToHome,
  moveCursorToEnd
} from './cursorNavigation';
import {
  handleBackspace,
  handleDelete,
  handleNewLine,
  insertChar
} from './inputHandler';
import { syncValue } from './syncValue';
import { validate } from './validate';

export function handleKey(
  this: any,
  key: Key | any, 
  event?: KeyEvent | any
): void {
  if (!this.focused && this.focused !== undefined) return;

  // Handle test format where key is passed as { name: 'keyname' }
  const actualKey = typeof key === 'object' && key.name ? key.name : key;
  const actualEvent = event || key;

  // Ensure state exists or use flat structure for testing
  const state = this.state || this;

  switch (actualKey) {
    case Key.LEFT:
    case 'left':
      moveCursorLeft(state, this.multiline);
      break;
    case Key.RIGHT:
    case 'right':
      moveCursorRight(state, this.multiline);
      break;
    case Key.HOME:
    case 'home':
      moveCursorToHome(state);
      break;
    case Key.END:
    case 'end':
      moveCursorToEnd(state, this.multiline);
      break;
    case Key.BACKSPACE:
    case 'backspace':
      handleBackspace(state, this.multiline);
      syncValue.call(this);
      this.emit && this.emit('change', state.value);
      break;
    case Key.DELETE:
    case 'delete':
      handleDelete(state, this.multiline);
      syncValue.call(this);
      this.emit && this.emit('change', state.value);
      break;
    case Key.ENTER:
    case 'enter':
    case 'return':
      if (this.multiline) {
        handleNewLine(state);
        syncValue.call(this);
        this.emit && this.emit('change', state.value);
      } else {
        validate.call(this);
        this.emit && this.emit('submit', state.value);
      }
      break;
    case Key.UP:
    case 'up':
      if (this.multiline) {
        moveCursorUp(state);
      }
      break;
    case Key.DOWN:
    case 'down':
      if (this.multiline) {
        moveCursorDown(state);
      }
      break;
    default:
      // Handle character input - check both event.key and key.name
      const charKey = actualEvent?.key || actualKey?.name || actualKey;
      if (charKey && charKey.length === 1 && !actualEvent?.ctrl && !actualEvent?.meta) {
        if (insertChar(state, charKey, this.maxLength, this.multiline)) {
          syncValue.call(this);
          this.emit && this.emit('change', state.value);
        }
      }
  }
  
  this.render && this.render();
}