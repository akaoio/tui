import { Color, color, reset } from '../../utils/colors';

export function render(this: any): void {
  if (!this.visible) return;

  let text = '';
  
  if (this.disabled) {
    text += color(Color.BrightBlack);
  } else if (this.focused) {
    text += color(Color.Cyan);
  }
  
  text += this.checked ? '[✓] ' : '[ ] ';
  text += this.label;
  text += reset();
  
  this.screen.writeAt(this.x, this.y, text);
}