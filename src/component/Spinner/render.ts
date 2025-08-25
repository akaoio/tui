import { color, reset } from '../../utils/colors';

export function render(this: any): void {
  if (!this.visible || !this.isSpinning) return;
  
  const frame = this.frames[this.currentFrame];
  let output = color(this.spinnerColor) + frame + reset();
  
  if (this.text) {
    output += ' ' + this.text;
  }
  
  this.screen.writeAt(this.x, this.y, output + '  ');
}