import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { EventEmitter } from 'events';

export interface ComponentOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  focused?: boolean;
  visible?: boolean;
}

export abstract class Component extends EventEmitter {
  protected screen: Screen;
  protected keyboard: Keyboard;
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected focused: boolean;
  protected visible: boolean;
  protected value: any;

  constructor(screen: Screen, keyboard: Keyboard, options: ComponentOptions = {}) {
    super();
    this.screen = screen;
    this.keyboard = keyboard;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 0;
    this.height = options.height || 1;
    this.focused = options.focused || false;
    this.visible = options.visible !== false;
  }

  abstract render(): void;
  abstract handleKey(key: Key, event: KeyEvent): void;

  focus(): void {
    this.focused = true;
    this.render();
    this.emit('focus');
  }

  blur(): void {
    this.focused = false;
    this.render();
    this.emit('blur');
  }

  show(): void {
    this.visible = true;
    this.render();
  }

  hide(): void {
    this.visible = false;
    this.clear();
  }

  clear(): void {
    if (!this.visible) return;
    for (let i = 0; i < this.height; i++) {
      this.screen.writeAt(this.x, this.y + i, ' '.repeat(this.width));
    }
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any): void {
    this.value = value;
    this.render();
    this.emit('change', value);
  }

  setPosition(x: number, y: number): void {
    this.clear();
    this.x = x;
    this.y = y;
    this.render();
  }

  setSize(width: number, height: number): void {
    this.clear();
    this.width = width;
    this.height = height;
    this.render();
  }

  isFocused(): boolean {
    return this.focused;
  }

  isVisible(): boolean {
    return this.visible;
  }
}