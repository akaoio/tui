/**
 * Form focusPrevious method
 */

import { focusCurrent } from './focusCurrent';
import { render } from './render';

export function focusPrevious(this: any): void {
  const totalItems = this.components.length + 2;
  this.currentIndex = this.currentIndex === 0 ? totalItems - 1 : this.currentIndex - 1;
  
  if (this.currentIndex < this.components.length) {
    focusCurrent.call(this);
  } else {
    this.components.forEach((component: any) => component.blur());
    render.call(this);
  }
}
