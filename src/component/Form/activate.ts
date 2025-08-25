/**
 * Form activate method
 */

import { focusCurrent } from './focusCurrent';
import { render } from './render';

export function activate(this: any): void {
  this.isActive = true;
  this.currentIndex = 0;
  focusCurrent.call(this);
  render.call(this);
}
