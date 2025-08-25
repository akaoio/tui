import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { RadioOptions } from './types';

export function constructor(this: any, screen: Screen, keyboard: Keyboard, options: RadioOptions) {
  // Parent constructor is already called in container class
  
  this.options = options.options || [];
  this.selectedIndex = options.selected || 0;
  this.orientation = options.orientation || 'vertical';
  
  if (this.orientation === 'vertical') {
    this.height = this.options.length;
  } else {
    this.height = 1;
    this.width = this.options.reduce((sum: number, opt: any) => sum + opt.label.length + 5, 0);
  }
  
  this.updateValue();
}