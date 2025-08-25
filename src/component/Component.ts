import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { EventEmitter } from 'events';
import { RenderMode, Position } from '../core/RenderMode';
import * as readline from 'readline';

export interface ComponentOptions extends Position {
  width?: number;
  height?: number;
  focused?: boolean;
  visible?: boolean;
  renderMode?: RenderMode;
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
  protected renderMode: RenderMode;
  protected rl?: readline.Interface;

  constructor(screen: Screen, keyboard: Keyboard, options: ComponentOptions = {}) {
    super();
    this.screen = screen;
    this.keyboard = keyboard;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width || 0;
    this.height = options.height || 1;
    this.focused = options.focused || false;
    this.visible = options.visible !== false;
    this.renderMode = options.renderMode || RenderMode.STREAM;
  }

  abstract render(): void;
  abstract handleKey(key: Key, event: KeyEvent): void;

  /**
   * Check if component is in stream mode
   */
  isStreamMode(): boolean {
    return this.renderMode === RenderMode.STREAM || this.renderMode === RenderMode.AUTO;
  }

  /**
   * Check if component is in absolute mode
   */
  isAbsoluteMode(): boolean {
    return this.renderMode === RenderMode.ABSOLUTE;
  }

  /**
   * Write text based on current render mode
   */
  protected write(text: string, x?: number, y?: number): void {
    if (this.isStreamMode()) {
      // In stream mode, just write to stdout
      process.stdout.write(text);
    } else {
      // In absolute mode, use screen.writeAt
      this.screen.writeAt(x ?? this.x, y ?? this.y, text);
    }
  }

  /**
   * Clear line or area based on render mode
   */
  protected clearArea(): void {
    if (this.isStreamMode()) {
      // In stream mode, use ANSI clear line
      process.stdout.write('\x1b[2K\r');
    } else {
      // In absolute mode, clear the component area
      for (let i = 0; i < this.height; i++) {
        this.screen.writeAt(this.x, this.y + i, ' '.repeat(this.width || this.screen.getWidth()));
      }
    }
  }

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
    this.clearArea();
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
    if (this.isAbsoluteMode()) {
      this.clear();
      this.x = x;
      this.y = y;
      this.render();
    }
    // In stream mode, position is ignored
  }

  setSize(width: number, height: number): void {
    this.clear();
    this.width = width;
    this.height = height;
    this.render();
  }

  setRenderMode(mode: RenderMode): void {
    this.renderMode = mode;
    this.render();
  }

  isFocused(): boolean {
    return this.focused;
  }

  isVisible(): boolean {
    return this.visible;
  }
}