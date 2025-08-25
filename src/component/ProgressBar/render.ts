import { color, reset } from '../../utils/colors';

export function render(this: any): void {
  if (!this.visible) return;

  const percentage = this.getPercentage();
  const filled = Math.floor((this.barWidth * percentage) / 100);
  const empty = this.barWidth - filled;
  
  let output = '';
  
  // Draw the progress bar
  output += '[';
  output += color(this.barColor) + this.completeChar.repeat(filled) + reset();
  output += this.incompleteChar.repeat(empty);
  output += ']';
  
  // Add percentage if enabled
  if (this.showPercentage) {
    output += ` ${percentage}%`;
  }
  
  // Add numbers if enabled
  if (this.showNumbers) {
    output += ` (${this.current}/${this.total})`;
  }
  
  this.screen.writeAt(this.x, this.y, output);
}