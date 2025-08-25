/**
 * Form setupKeyboardHandlers method
 */

import { Key } from '../../core/keyboard';
import { focusPrevious } from './focusPrevious';
import { focusNext } from './focusNext';
import { isInputComponent } from './isInputComponent';
import { cancel } from './cancel';

export function setupKeyboardHandlers(this: any): void {
  this.keyboard.onKey((key: any, event: any) => {
    if (!this.isActive) return;
    
    const currentComponent = this.components[this.currentIndex];
    
    switch (key) {
      case Key.TAB:
        if (event.shift) {
          focusPrevious.call(this);
        } else {
          focusNext.call(this);
        }
        break;
      case Key.UP:
        if (currentComponent && !isInputComponent.call(this, currentComponent)) {
          focusPrevious.call(this);
        } else {
          currentComponent?.handleKey(key, event);
        }
        break;
      case Key.DOWN:
        if (currentComponent && !isInputComponent.call(this, currentComponent)) {
          focusNext.call(this);
        } else {
          currentComponent?.handleKey(key, event);
        }
        break;
      case Key.ESCAPE:
        cancel.call(this);
        break;
      case Key.CTRL_C:
        cancel.call(this);
        process.exit(0);
        break;
      default:
        currentComponent?.handleKey(key, event);
    }
  });
  
  this.keyboard.onChar((_char: any, event: any) => {
    if (!this.isActive) return;
    const currentComponent = this.components[this.currentIndex];
    currentComponent?.handleKey(Key.ENTER, event);
  });
}
