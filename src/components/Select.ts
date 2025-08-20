import { Component, ComponentOptions } from './Component';
import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { Color, color, reset, BgColor } from '../utils/colors';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface SelectOptions extends ComponentOptions {
  options: SelectOption[];
  selected?: number;
  multiple?: boolean;
  maxDisplay?: number;
}

export class Select extends Component {
  private options: SelectOption[];
  private selectedIndex: number;
  private hoveredIndex: number;
  private scrollOffset: number;
  private multiple: boolean;
  private selectedIndices: Set<number>;
  private maxDisplay: number;
  private isOpen: boolean;

  constructor(screen: Screen, keyboard: Keyboard, options: SelectOptions) {
    super(screen, keyboard, options);
    this.options = options.options || [];
    this.selectedIndex = options.selected || 0;
    this.hoveredIndex = this.selectedIndex;
    this.scrollOffset = 0;
    this.multiple = options.multiple || false;
    this.selectedIndices = new Set();
    this.maxDisplay = options.maxDisplay || 10;
    this.isOpen = false;
    this.height = 1;
    
    if (this.multiple && this.selectedIndex >= 0) {
      this.selectedIndices.add(this.selectedIndex);
    }
    
    this.updateValue();
  }

  render(): void {
    if (!this.visible) return;

    if (this.focused && this.isOpen) {
      this.renderOpen();
    } else {
      this.renderClosed();
    }
  }

  private renderClosed(): void {
    const selectedOption = this.options[this.selectedIndex];
    const label = selectedOption ? selectedOption.label : 'Select...';
    const width = this.width || 30;
    
    let text = '';
    
    if (this.focused) {
      text += color(Color.Cyan);
    }
    
    text += '▼ ' + label;
    
    if (text.length < width) {
      text += ' '.repeat(width - label.length - 2);
    }
    
    text += reset();
    
    this.screen.writeAt(this.x, this.y, text);
  }

  private renderOpen(): void {
    const width = this.width || 30;
    const displayCount = Math.min(this.options.length, this.maxDisplay);
    
    this.screen.writeAt(this.x, this.y, '▲ Select option' + ' '.repeat(width - 15));
    
    this.screen.writeAt(this.x, this.y + 1, '┌' + '─'.repeat(width - 2) + '┐');
    
    const visibleOptions = this.options.slice(this.scrollOffset, this.scrollOffset + displayCount);
    
    visibleOptions.forEach((option, index) => {
      const actualIndex = this.scrollOffset + index;
      const isHovered = actualIndex === this.hoveredIndex;
      const isSelected = this.multiple 
        ? this.selectedIndices.has(actualIndex)
        : actualIndex === this.selectedIndex;
      
      let line = '│ ';
      
      if (this.multiple) {
        line += isSelected ? '[✓] ' : '[ ] ';
      } else {
        line += isSelected ? '● ' : '○ ';
      }
      
      let optionText = option.label;
      
      if (option.disabled) {
        optionText = color(Color.BrightBlack) + optionText + reset();
      } else if (isHovered) {
        optionText = color(Color.Black, BgColor.Cyan) + optionText + reset();
      } else if (isSelected && !this.multiple) {
        optionText = color(Color.Cyan) + optionText + reset();
      }
      
      line += optionText;
      
      const lineLength = this.stripAnsi(line).length;
      if (lineLength < width - 1) {
        line += ' '.repeat(width - lineLength - 1);
      }
      
      line += '│';
      
      this.screen.writeAt(this.x, this.y + 2 + index, line);
    });
    
    this.screen.writeAt(this.x, this.y + 2 + displayCount, '└' + '─'.repeat(width - 2) + '┘');
    
    if (this.options.length > this.maxDisplay) {
      const scrollbarHeight = Math.max(1, Math.floor(displayCount * displayCount / this.options.length));
      const scrollbarPosition = Math.floor(this.scrollOffset * displayCount / this.options.length);
      
      for (let i = 0; i < displayCount; i++) {
        const char = i >= scrollbarPosition && i < scrollbarPosition + scrollbarHeight ? '█' : '│';
        this.screen.writeAt(this.x + width - 1, this.y + 2 + i, char);
      }
    }
    
    this.height = displayCount + 3;
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  handleKey(key: Key, event: KeyEvent): void {
    if (!this.focused) return;

    switch (key) {
      case Key.ENTER:
      case Key.SPACE:
        if (this.isOpen) {
          this.selectCurrent();
        } else {
          this.open();
        }
        break;
      case Key.ESCAPE:
        if (this.isOpen) {
          this.close();
        }
        break;
      case Key.UP:
        if (this.isOpen) {
          this.moveUp();
        }
        break;
      case Key.DOWN:
        if (this.isOpen) {
          this.moveDown();
        } else {
          this.open();
        }
        break;
      case Key.HOME:
        if (this.isOpen) {
          this.hoveredIndex = 0;
          this.scrollOffset = 0;
        }
        break;
      case Key.END:
        if (this.isOpen) {
          this.hoveredIndex = this.options.length - 1;
          this.updateScroll();
        }
        break;
      case Key.PAGEUP:
        if (this.isOpen) {
          this.hoveredIndex = Math.max(0, this.hoveredIndex - this.maxDisplay);
          this.updateScroll();
        }
        break;
      case Key.PAGEDOWN:
        if (this.isOpen) {
          this.hoveredIndex = Math.min(this.options.length - 1, this.hoveredIndex + this.maxDisplay);
          this.updateScroll();
        }
        break;
    }
    
    this.render();
  }

  private open(): void {
    this.isOpen = true;
    this.hoveredIndex = this.selectedIndex;
    this.updateScroll();
    this.emit('open');
  }

  private close(): void {
    this.isOpen = false;
    this.height = 1;
    this.clear();
    this.emit('close');
  }

  private moveUp(): void {
    do {
      this.hoveredIndex = Math.max(0, this.hoveredIndex - 1);
    } while (this.hoveredIndex > 0 && this.options[this.hoveredIndex]?.disabled);
    
    this.updateScroll();
  }

  private moveDown(): void {
    do {
      this.hoveredIndex = Math.min(this.options.length - 1, this.hoveredIndex + 1);
    } while (this.hoveredIndex < this.options.length - 1 && this.options[this.hoveredIndex]?.disabled);
    
    this.updateScroll();
  }

  private updateScroll(): void {
    if (this.hoveredIndex < this.scrollOffset) {
      this.scrollOffset = this.hoveredIndex;
    } else if (this.hoveredIndex >= this.scrollOffset + this.maxDisplay) {
      this.scrollOffset = this.hoveredIndex - this.maxDisplay + 1;
    }
  }

  private selectCurrent(): void {
    const option = this.options[this.hoveredIndex];
    if (!option || option.disabled) return;
    
    if (this.multiple) {
      if (this.selectedIndices.has(this.hoveredIndex)) {
        this.selectedIndices.delete(this.hoveredIndex);
      } else {
        this.selectedIndices.add(this.hoveredIndex);
      }
      this.updateValue();
    } else {
      this.selectedIndex = this.hoveredIndex;
      this.updateValue();
      this.close();
    }
    
    this.emit('select', this.value);
  }

  private updateValue(): void {
    if (this.multiple) {
      this.value = Array.from(this.selectedIndices).map(i => this.options[i]?.value);
    } else {
      this.value = this.options[this.selectedIndex]?.value;
    }
  }

  clear(): void {
    for (let i = 0; i < this.height; i++) {
      this.screen.writeAt(this.x, this.y + i, ' '.repeat(this.width || 30));
    }
  }

  setOptions(options: SelectOption[]): void {
    this.options = options;
    this.selectedIndex = 0;
    this.hoveredIndex = 0;
    this.scrollOffset = 0;
    this.selectedIndices.clear();
    this.updateValue();
    this.render();
  }

  getSelectedOption(): SelectOption | null {
    return this.options[this.selectedIndex] || null;
  }

  getSelectedOptions(): SelectOption[] {
    if (this.multiple) {
      return Array.from(this.selectedIndices).map(i => this.options[i]).filter(Boolean);
    }
    const option = this.getSelectedOption();
    return option ? [option] : [];
  }
}