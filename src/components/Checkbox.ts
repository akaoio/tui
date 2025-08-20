import { Component, ComponentOptions } from './Component';
import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { Color, color, reset } from '../utils/colors';

export interface CheckboxOptions extends ComponentOptions {
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

export class Checkbox extends Component {
  private label: string;
  private checked: boolean;
  private disabled: boolean;

  constructor(screen: Screen, keyboard: Keyboard, options: CheckboxOptions) {
    super(screen, keyboard, options);
    this.label = options.label;
    this.checked = options.checked || false;
    this.disabled = options.disabled || false;
    this.value = this.checked;
  }

  render(): void {
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

  handleKey(key: Key, _event: KeyEvent): void {
    if (!this.focused || this.disabled) return;

    if (key === Key.SPACE) {
      this.toggle();
    } else if (key === Key.ENTER) {
      this.toggle();
      this.emit('submit', this.checked);
    }
  }

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.value = this.checked;
    this.render();
    this.emit('change', this.checked);
  }

  check(): void {
    if (this.disabled) return;
    this.checked = true;
    this.value = true;
    this.render();
    this.emit('change', true);
  }

  uncheck(): void {
    if (this.disabled) return;
    this.checked = false;
    this.value = false;
    this.render();
    this.emit('change', false);
  }

  isChecked(): boolean {
    return this.checked;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.render();
  }

  isDisabled(): boolean {
    return this.disabled;
  }
}