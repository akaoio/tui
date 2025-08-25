/**
 * Form removeComponent method
 */

import { render } from './render';

export function removeComponent(this: any, index: number): void {
  if (index >= 0 && index < this.components.length) {
    this.components.splice(index, 1);
    if (this.currentIndex >= this.components.length) {
      this.currentIndex = Math.max(0, this.components.length - 1);
    }
    render.call(this);
  }
}
