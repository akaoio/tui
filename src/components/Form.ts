import { EventEmitter } from 'events';
import { Screen } from '../core/screen';
import { Keyboard, Key } from '../core/keyboard';
import { Component } from './Component';
import { Color, BgColor, color, reset } from '../utils/colors';
import { BoxStyles, drawBox } from '../utils/styles';

export interface FormOptions {
  title?: string;
  components: Component[];
  submitLabel?: string;
  cancelLabel?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class Form extends EventEmitter {
  private screen: Screen;
  private keyboard: Keyboard;
  private title: string;
  private components: Component[];
  private currentIndex: number;
  private submitLabel: string;
  private cancelLabel: string;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private isActive: boolean;

  constructor(screen: Screen, keyboard: Keyboard, options: FormOptions) {
    super();
    this.screen = screen;
    this.keyboard = keyboard;
    this.title = options.title || '';
    this.components = options.components || [];
    this.currentIndex = 0;
    this.submitLabel = options.submitLabel || 'Submit';
    this.cancelLabel = options.cancelLabel || 'Cancel';
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 50;
    this.height = options.height || 20;
    this.isActive = false;
    
    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers(): void {
    this.keyboard.onKey((key, event) => {
      if (!this.isActive) return;
      
      const currentComponent = this.components[this.currentIndex];
      
      switch (key) {
        case Key.TAB:
          if (event.shift) {
            this.focusPrevious();
          } else {
            this.focusNext();
          }
          break;
        case Key.UP:
          if (currentComponent && !this.isInputComponent(currentComponent)) {
            this.focusPrevious();
          } else {
            currentComponent?.handleKey(key, event);
          }
          break;
        case Key.DOWN:
          if (currentComponent && !this.isInputComponent(currentComponent)) {
            this.focusNext();
          } else {
            currentComponent?.handleKey(key, event);
          }
          break;
        case Key.ESCAPE:
          this.cancel();
          break;
        case Key.CTRL_C:
          this.cancel();
          process.exit(0);
          break;
        default:
          currentComponent?.handleKey(key, event);
      }
    });
    
    this.keyboard.onChar((_char, event) => {
      if (!this.isActive) return;
      const currentComponent = this.components[this.currentIndex];
      currentComponent?.handleKey(Key.ENTER, event);
    });
  }

  private isInputComponent(component: Component): boolean {
    // Check if component is an Input or Select (which handle UP/DOWN internally)
    return component.constructor.name === 'Input' || 
           component.constructor.name === 'Select';
  }

  render(): void {
    // Clear and draw border
    const box = drawBox(this.width, this.height, BoxStyles.Rounded);
    box.forEach((line, index) => {
      this.screen.writeAt(this.x, this.y + index, line);
    });
    
    // Draw title if provided
    if (this.title) {
      const titleText = ` ${this.title} `;
      const titleX = this.x + Math.floor((this.width - titleText.length) / 2);
      this.screen.writeAt(titleX, this.y, color(Color.Cyan) + titleText + reset());
    }
    
    // Position and render components
    let currentY = this.y + 2;
    this.components.forEach((component) => {
      component.setPosition(this.x + 2, currentY);
      component.render();
      currentY += component.isVisible() ? 2 : 0;
    });
    
    // Draw submit and cancel buttons
    const buttonY = this.y + this.height - 2;
    const submitX = this.x + 2;
    const cancelX = this.x + this.width - this.cancelLabel.length - 4;
    
    const submitColor = this.currentIndex === this.components.length ? Color.Black : Color.White;
    const submitBg = this.currentIndex === this.components.length ? BgColor.Cyan : BgColor.Default;
    const cancelColor = this.currentIndex === this.components.length + 1 ? Color.Black : Color.White;
    const cancelBg = this.currentIndex === this.components.length + 1 ? BgColor.Red : BgColor.Default;
    
    this.screen.writeAt(
      submitX,
      buttonY,
      color(submitColor, submitBg) + ` ${this.submitLabel} ` + reset()
    );
    
    this.screen.writeAt(
      cancelX,
      buttonY,
      color(cancelColor, cancelBg) + ` ${this.cancelLabel} ` + reset()
    );
  }

  activate(): void {
    this.isActive = true;
    this.currentIndex = 0;
    this.focusCurrent();
    this.render();
  }

  deactivate(): void {
    this.isActive = false;
    this.components.forEach(component => component.blur());
  }

  private focusCurrent(): void {
    this.components.forEach((component, index) => {
      if (index === this.currentIndex) {
        component.focus();
      } else {
        component.blur();
      }
    });
    this.render();
  }

  private focusNext(): void {
    const totalItems = this.components.length + 2; // +2 for submit and cancel buttons
    this.currentIndex = (this.currentIndex + 1) % totalItems;
    
    if (this.currentIndex < this.components.length) {
      this.focusCurrent();
    } else {
      this.components.forEach(component => component.blur());
      this.render();
    }
  }

  private focusPrevious(): void {
    const totalItems = this.components.length + 2;
    this.currentIndex = this.currentIndex === 0 ? totalItems - 1 : this.currentIndex - 1;
    
    if (this.currentIndex < this.components.length) {
      this.focusCurrent();
    } else {
      this.components.forEach(component => component.blur());
      this.render();
    }
  }

  private _submit(): void {
    const values: { [key: string]: any } = {};
    this.components.forEach((component, index) => {
      values[`field_${index}`] = component.getValue();
    });
    this.emit('submit', values);
  }

  private cancel(): void {
    this.emit('cancel');
  }

  getValues(): { [key: string]: any } {
    const values: { [key: string]: any } = {};
    this.components.forEach((component, index) => {
      values[`field_${index}`] = component.getValue();
    });
    return values;
  }

  setComponent(index: number, component: Component): void {
    if (index >= 0 && index < this.components.length) {
      this.components[index] = component;
      this.render();
    }
  }

  addComponent(component: Component): void {
    this.components.push(component);
    this.render();
  }

  removeComponent(index: number): void {
    if (index >= 0 && index < this.components.length) {
      this.components.splice(index, 1);
      if (this.currentIndex >= this.components.length) {
        this.currentIndex = Math.max(0, this.components.length - 1);
      }
      this.render();
    }
  }

  clear(): void {
    for (let i = 0; i < this.height; i++) {
      this.screen.writeAt(this.x, this.y + i, ' '.repeat(this.width));
    }
  }
}