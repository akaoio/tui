import { Component, ComponentOptions } from './Component';
import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { Color, color, reset } from '../utils/colors';
import { underline } from '../utils/styles';

export interface InputOptions extends ComponentOptions {
  placeholder?: string;
  value?: string;
  maxLength?: number;
  password?: boolean;
  multiline?: boolean;
  validator?: (value: string) => string | null;
}

export class Input extends Component {
  private placeholder: string;
  private cursorPosition: number;
  private scrollOffset: number;
  private maxLength: number;
  private password: boolean;
  private multiline: boolean;
  private lines: string[];
  private currentLine: number;
  private validator?: (value: string) => string | null;
  private error: string | null = null;

  constructor(screen: Screen, keyboard: Keyboard, options: InputOptions = {}) {
    super(screen, keyboard, options);
    this.placeholder = options.placeholder || '';
    this.value = options.value || '';
    this.cursorPosition = this.value.length;
    this.scrollOffset = 0;
    this.maxLength = options.maxLength || Infinity;
    this.password = options.password || false;
    this.multiline = options.multiline || false;
    this.validator = options.validator;
    
    if (this.multiline) {
      this.lines = this.value ? this.value.split('\n') : [''];
      this.currentLine = this.lines.length - 1;
      this.height = Math.max(3, options.height || 5);
    } else {
      this.lines = [this.value];
      this.currentLine = 0;
      this.height = 1;
    }
  }

  render(): void {
    if (!this.visible) return;

    if (this.multiline) {
      this.renderMultiline();
    } else {
      this.renderSingleLine();
    }
  }

  private renderSingleLine(): void {
    const displayValue = this.password ? '*'.repeat(this.value.length) : this.value;
    const displayText = displayValue || this.placeholder;
    const isPlaceholder = !this.value && this.placeholder;
    
    let text = '';
    
    if (this.focused) {
      text += color(Color.Cyan);
    }
    
    if (isPlaceholder) {
      text += color(Color.BrightBlack);
    }
    
    const maxWidth = this.width || this.screen.getWidth() - this.x;
    let visibleText = displayText;
    
    if (displayText.length > maxWidth - 1) {
      if (this.cursorPosition - this.scrollOffset >= maxWidth - 1) {
        this.scrollOffset = this.cursorPosition - maxWidth + 2;
      } else if (this.cursorPosition < this.scrollOffset) {
        this.scrollOffset = this.cursorPosition;
      }
      visibleText = displayText.substring(this.scrollOffset, this.scrollOffset + maxWidth - 1);
    }
    
    if (this.focused && !isPlaceholder) {
      const cursorPos = this.cursorPosition - this.scrollOffset;
      if (cursorPos >= 0 && cursorPos <= visibleText.length) {
        const before = visibleText.substring(0, cursorPos);
        const at = visibleText[cursorPos] || ' ';
        const after = visibleText.substring(cursorPos + 1);
        text += before + underline(at) + after;
      } else {
        text += visibleText;
      }
    } else {
      text += visibleText;
    }
    
    text += reset();
    
    if (text.length < maxWidth) {
      text += ' '.repeat(maxWidth - visibleText.length);
    }
    
    this.screen.writeAt(this.x, this.y, text);
    
    if (this.error) {
      this.screen.writeAt(
        this.x,
        this.y + 1,
        color(Color.Red) + this.error + reset()
      );
    }
  }

  private renderMultiline(): void {
    const boxWidth = this.width || 40;
    const boxHeight = this.height;
    
    this.screen.writeAt(this.x, this.y, '┌' + '─'.repeat(boxWidth - 2) + '┐');
    
    for (let i = 1; i < boxHeight - 1; i++) {
      this.screen.writeAt(this.x, this.y + i, '│' + ' '.repeat(boxWidth - 2) + '│');
    }
    
    this.screen.writeAt(this.x, this.y + boxHeight - 1, '└' + '─'.repeat(boxWidth - 2) + '┘');
    
    const visibleLines = boxHeight - 2;
    const startLine = Math.max(0, this.currentLine - visibleLines + 1);
    
    for (let i = 0; i < visibleLines && startLine + i < this.lines.length; i++) {
      const lineIndex = startLine + i;
      const line = this.lines[lineIndex] || '';
      const displayLine = this.password ? '*'.repeat(line.length) : line;
      
      let text = '';
      
      if (this.focused && lineIndex === this.currentLine) {
        const cursorPos = this.cursorPosition;
        const before = displayLine.substring(0, cursorPos);
        const at = displayLine[cursorPos] || ' ';
        const after = displayLine.substring(cursorPos + 1);
        text = before + underline(at) + after;
      } else {
        text = displayLine;
      }
      
      if (text.length > boxWidth - 2) {
        text = text.substring(0, boxWidth - 2);
      }
      
      this.screen.writeAt(this.x + 1, this.y + i + 1, text + ' '.repeat(boxWidth - 2 - text.length));
    }
  }

  handleKey(key: Key, event: KeyEvent): void {
    if (!this.focused) return;

    switch (key) {
      case Key.LEFT:
        this.moveCursorLeft();
        break;
      case Key.RIGHT:
        this.moveCursorRight();
        break;
      case Key.HOME:
        this.cursorPosition = 0;
        break;
      case Key.END:
        if (this.multiline) {
          this.cursorPosition = this.lines[this.currentLine]?.length || 0;
        } else {
          this.cursorPosition = this.value.length;
        }
        break;
      case Key.BACKSPACE:
        this.handleBackspace();
        break;
      case Key.DELETE:
        this.handleDelete();
        break;
      case Key.ENTER:
        if (this.multiline) {
          this.handleNewLine();
        } else {
          this.validate();
          this.emit('submit', this.value);
        }
        break;
      case Key.UP:
        if (this.multiline) {
          this.moveCursorUp();
        }
        break;
      case Key.DOWN:
        if (this.multiline) {
          this.moveCursorDown();
        }
        break;
      default:
        if (event.key && event.key.length === 1 && !event.ctrl && !event.meta) {
          this.insertChar(event.key);
        }
    }
    
    this.render();
  }

  private moveCursorLeft(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
    } else if (this.multiline && this.currentLine > 0) {
      this.currentLine--;
      this.cursorPosition = this.lines[this.currentLine]?.length || 0;
    }
  }

  private moveCursorRight(): void {
    if (this.multiline) {
      const currentLineLength = this.lines[this.currentLine]?.length || 0;
      if (this.cursorPosition < currentLineLength) {
        this.cursorPosition++;
      } else if (this.currentLine < this.lines.length - 1) {
        this.currentLine++;
        this.cursorPosition = 0;
      }
    } else {
      if (this.cursorPosition < this.value.length) {
        this.cursorPosition++;
      }
    }
  }

  private moveCursorUp(): void {
    if (this.currentLine > 0) {
      this.currentLine--;
      const lineLength = this.lines[this.currentLine]?.length || 0;
      this.cursorPosition = Math.min(this.cursorPosition, lineLength);
    }
  }

  private moveCursorDown(): void {
    if (this.currentLine < this.lines.length - 1) {
      this.currentLine++;
      const lineLength = this.lines[this.currentLine]?.length || 0;
      this.cursorPosition = Math.min(this.cursorPosition, lineLength);
    }
  }

  private handleBackspace(): void {
    if (this.multiline) {
      const line = this.lines[this.currentLine] || '';
      if (this.cursorPosition > 0) {
        this.lines[this.currentLine] = 
          line.substring(0, this.cursorPosition - 1) + 
          line.substring(this.cursorPosition);
        this.cursorPosition--;
      } else if (this.currentLine > 0) {
        const prevLine = this.lines[this.currentLine - 1] || '';
        this.cursorPosition = prevLine.length;
        this.lines[this.currentLine - 1] = prevLine + line;
        this.lines.splice(this.currentLine, 1);
        this.currentLine--;
      }
      this.value = this.lines.join('\n');
    } else {
      if (this.cursorPosition > 0) {
        this.value = 
          this.value.substring(0, this.cursorPosition - 1) + 
          this.value.substring(this.cursorPosition);
        this.cursorPosition--;
      }
    }
    this.emit('change', this.value);
  }

  private handleDelete(): void {
    if (this.multiline) {
      const line = this.lines[this.currentLine] || '';
      if (this.cursorPosition < line.length) {
        this.lines[this.currentLine] = 
          line.substring(0, this.cursorPosition) + 
          line.substring(this.cursorPosition + 1);
      } else if (this.currentLine < this.lines.length - 1) {
        this.lines[this.currentLine] = line + (this.lines[this.currentLine + 1] || '');
        this.lines.splice(this.currentLine + 1, 1);
      }
      this.value = this.lines.join('\n');
    } else {
      if (this.cursorPosition < this.value.length) {
        this.value = 
          this.value.substring(0, this.cursorPosition) + 
          this.value.substring(this.cursorPosition + 1);
      }
    }
    this.emit('change', this.value);
  }

  private handleNewLine(): void {
    const line = this.lines[this.currentLine] || '';
    const before = line.substring(0, this.cursorPosition);
    const after = line.substring(this.cursorPosition);
    this.lines[this.currentLine] = before;
    this.lines.splice(this.currentLine + 1, 0, after);
    this.currentLine++;
    this.cursorPosition = 0;
    this.value = this.lines.join('\n');
    this.emit('change', this.value);
  }

  private insertChar(char: string): void {
    if (this.value.length >= this.maxLength) return;
    
    if (this.multiline) {
      const line = this.lines[this.currentLine] || '';
      this.lines[this.currentLine] = 
        line.substring(0, this.cursorPosition) + 
        char + 
        line.substring(this.cursorPosition);
      this.cursorPosition++;
      this.value = this.lines.join('\n');
    } else {
      this.value = 
        this.value.substring(0, this.cursorPosition) + 
        char + 
        this.value.substring(this.cursorPosition);
      this.cursorPosition++;
    }
    
    this.emit('change', this.value);
  }

  private validate(): void {
    if (this.validator) {
      this.error = this.validator(this.value);
      if (this.error) {
        this.emit('error', this.error);
      }
    }
  }

  setValidator(validator: (value: string) => string | null): void {
    this.validator = validator;
  }

  getError(): string | null {
    return this.error;
  }

  clearError(): void {
    this.error = null;
    this.render();
  }
}