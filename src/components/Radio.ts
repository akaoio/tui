import { Component, ComponentOptions } from './Component';
import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { Color, color, reset } from '../utils/colors';

export interface RadioOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface RadioOptions extends ComponentOptions {
  options: RadioOption[];
  selected?: number;
  orientation?: 'horizontal' | 'vertical';
}

export class Radio extends Component {
  private options: RadioOption[];
  private selectedIndex: number;
  private orientation: 'horizontal' | 'vertical';

  constructor(screen: Screen, keyboard: Keyboard, options: RadioOptions) {
    super(screen, keyboard, options);
    this.options = options.options || [];
    this.selectedIndex = options.selected || 0;
    this.orientation = options.orientation || 'vertical';
    
    if (this.orientation === 'vertical') {
      this.height = this.options.length;
    } else {
      this.height = 1;
      this.width = this.options.reduce((sum, opt) => sum + opt.label.length + 5, 0);
    }
    
    this.updateValue();
  }

  render(): void {
    if (!this.visible) return;

    if (this.orientation === 'vertical') {
      this.renderVertical();
    } else {
      this.renderHorizontal();
    }
  }

  private renderVertical(): void {
    this.options.forEach((option, index) => {
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

  private renderHorizontal(): void {
    let x = this.x;
    
    this.options.forEach((option, index) => {
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

  handleKey(key: Key, _event: KeyEvent): void {
    if (!this.focused) return;

    switch (key) {
      case Key.UP:
        if (this.orientation === 'vertical') {
          this.selectPrevious();
        }
        break;
      case Key.DOWN:
        if (this.orientation === 'vertical') {
          this.selectNext();
        }
        break;
      case Key.LEFT:
        if (this.orientation === 'horizontal') {
          this.selectPrevious();
        }
        break;
      case Key.RIGHT:
        if (this.orientation === 'horizontal') {
          this.selectNext();
        }
        break;
      case Key.SPACE:
      case Key.ENTER:
        this.emit('select', this.value);
        break;
      case Key.HOME:
        this.selectFirst();
        break;
      case Key.END:
        this.selectLast();
        break;
    }
    
    this.render();
  }

  private selectNext(): void {
    let nextIndex = this.selectedIndex;
    do {
      nextIndex = (nextIndex + 1) % this.options.length;
    } while (this.options[nextIndex]?.disabled && nextIndex !== this.selectedIndex);
    
    if (nextIndex !== this.selectedIndex && !this.options[nextIndex]?.disabled) {
      this.selectedIndex = nextIndex;
      this.updateValue();
      this.emit('change', this.value);
    }
  }

  private selectPrevious(): void {
    let prevIndex = this.selectedIndex;
    do {
      prevIndex = prevIndex === 0 ? this.options.length - 1 : prevIndex - 1;
    } while (this.options[prevIndex]?.disabled && prevIndex !== this.selectedIndex);
    
    if (prevIndex !== this.selectedIndex && !this.options[prevIndex]?.disabled) {
      this.selectedIndex = prevIndex;
      this.updateValue();
      this.emit('change', this.value);
    }
  }

  private selectFirst(): void {
    for (let i = 0; i < this.options.length; i++) {
      if (!this.options[i]?.disabled) {
        this.selectedIndex = i;
        this.updateValue();
        this.emit('change', this.value);
        break;
      }
    }
  }

  private selectLast(): void {
    for (let i = this.options.length - 1; i >= 0; i--) {
      if (!this.options[i]?.disabled) {
        this.selectedIndex = i;
        this.updateValue();
        this.emit('change', this.value);
        break;
      }
    }
  }

  private updateValue(): void {
    this.value = this.options[this.selectedIndex]?.value;
  }

  select(index: number): void {
    if (index >= 0 && index < this.options.length && !this.options[index]?.disabled) {
      this.selectedIndex = index;
      this.updateValue();
      this.render();
      this.emit('change', this.value);
    }
  }

  selectByValue(value: any): void {
    const index = this.options.findIndex(opt => opt.value === value);
    if (index >= 0) {
      this.select(index);
    }
  }

  getSelectedOption(): RadioOption | null {
    return this.options[this.selectedIndex] || null;
  }
}