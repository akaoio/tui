/**
 * Form focusCurrent method
 */

import { render } from './render';

export function focusCurrent(this: any): void {
  this.components.forEach((component: any, index: number) => {
    if (index === this.currentIndex) {
      component.focus();
    } else {
      component.blur();
    }
  });
  render.call(this);
}
