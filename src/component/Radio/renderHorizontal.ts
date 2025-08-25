import { Color, color, reset } from '../../utils/colors';

export function renderHorizontal(this: any): void {
  let x = this.x;
  
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
    
    this.screen.writeAt(x, this.y, text);
    x += option.label.length + 5;
  });
}