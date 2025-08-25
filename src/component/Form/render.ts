/**
 * Form render method
 */

import { Color, BgColor, color, reset } from '../../utils/colors';
import { BoxStyles, drawBox } from '../../utils/styles';

export function render(this: any): void {
  // Clear and draw border
  const box = drawBox(this.width, this.height, BoxStyles.Rounded);
  const lines = box.split('\n');
  lines.forEach((line: string, index: number) => {
    this.screen.writeAt(this.x, this.y + index, line);
  });
  
  // Draw title if provided
  if (this.title) {
    const titleText = ` ${this.title} `;
    const titleX = this.x + Math.floor((this.width - titleText.length) / 2);
    this.screen.writeAt(titleX, this.y, color(Color.Cyan) + titleText + reset());
  }
  
  // Position and render components
  let currentY = this.y + 2;
  this.components.forEach((component: any) => {
    component.setPosition(this.x + 2, currentY);
    component.render();
    currentY += component.isVisible() ? 2 : 0;
  });
  
  // Draw submit and cancel buttons
  const buttonY = this.y + this.height - 2;
  const submitX = this.x + 2;
  const cancelX = this.x + this.width - this.cancelLabel.length - 4;
  
  const submitColor = this.currentIndex === this.components.length ? Color.Black : Color.White;
  const submitBg = this.currentIndex === this.components.length ? BgColor.Cyan : BgColor.Default;
  const cancelColor = this.currentIndex === this.components.length + 1 ? Color.Black : Color.White;
  const cancelBg = this.currentIndex === this.components.length + 1 ? BgColor.Red : BgColor.Default;
  
  this.screen.writeAt(
    submitX,
    buttonY,
    color(submitColor, submitBg) + ` ${this.submitLabel} ` + reset()
  );
  
  this.screen.writeAt(
    cancelX,
    buttonY,
    color(cancelColor, cancelBg) + ` ${this.cancelLabel} ` + reset()
  );
}
