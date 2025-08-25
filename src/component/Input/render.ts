/**
 * Input render method
 */

import { renderSingleLine } from './singleLineRenderer';
import { renderMultiline } from './multilineRenderer';

export function render(this: any): void {
  if (!this.visible) return;

  if (this.multiline) {
    renderMultiline(
      this.screen,
      this.x,
      this.y,
      this.width || 40,
      this.height,
      this.state,
      this.password,
      this.focused
    );
  } else {
    renderSingleLine(
      this.screen,
      this.x,
      this.y,
      this.width,
      this.state,
      this.placeholder,
      this.password,
      this.focused
    );
  }
}