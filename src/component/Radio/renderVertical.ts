import { Color, color, reset } from '../../utils/colors';

export function renderVertical(this: any): void {
  this.options.forEach((option: any, index: number) => {
    let text = '';
    
    if (option.disabled) {
      text += color(Color.BrightBlack);
    } else if (this.focused && index === this.selectedIndex) {
      text += color(Color.Cyan);
    }
    
    text += index === this.selectedIndex ? '(●) ' : '( ) ';
    text += option.label;
    text += reset();
    
    this.screen.writeAt(this.x, this.y + index, text);
  });
}