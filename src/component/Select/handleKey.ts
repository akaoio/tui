/**
 * Select handleKey method
 */

import { Key, KeyEvent } from '../../core/keyboard';
import { open } from './open';
import { close } from './close';
import { selectCurrent } from './selectCurrent';
import { render } from './render';

export function handleKey(this: any, key: Key, _event: KeyEvent): void {
  if (!this.focused) return;

  switch (key) {
    case Key.ENTER:
    case Key.SPACE:
      if (this.state.isOpen) {
        selectCurrent.call(this);
      } else {
        open.call(this);
      }
      break;
    case Key.ESCAPE:
      if (this.state.isOpen) {
        close.call(this);
      }
      break;
    case Key.UP:
      if (this.state.isOpen) {
        this.navigation.moveUp(this.state);
      }
      break;
    case Key.DOWN:
      if (this.state.isOpen) {
        this.navigation.moveDown(this.state);
      } else {
        open.call(this);
      }
      break;
    case Key.HOME:
      if (this.state.isOpen) {
        this.navigation.moveToStart(this.state);
      }
      break;
    case Key.END:
      if (this.state.isOpen) {
        this.navigation.moveToEnd(this.state);
      }
      break;
    case Key.PAGEUP:
      if (this.state.isOpen) {
        this.navigation.pageUp(this.state);
      }
      break;
    case Key.PAGEDOWN:
      if (this.state.isOpen) {
        this.navigation.pageDown(this.state);
      }
      break;
  }
  
  render.call(this);
}