/**
 * Form focusNext method
 */

import { focusCurrent } from './focusCurrent';
import { render } from './render';

export function focusNext(this: any): void {
  const totalItems = this.components.length + 2; // +2 for submit and cancel buttons
  this.currentIndex = (this.currentIndex + 1) % totalItems;
  
  if (this.currentIndex < this.components.length) {
    focusCurrent.call(this);
  } else {
    this.components.forEach((component: any) => component.blur());
    render.call(this);
  }
}
