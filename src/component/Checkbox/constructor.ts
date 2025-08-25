import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { CheckboxOptions } from './types';

export function constructor(this: any, screen: Screen, keyboard: Keyboard, options: CheckboxOptions) {
  // Parent constructor is already called in container class
  
  this.label = options.label;
  this.checked = options.checked || false;
  this.disabled = options.disabled || false;
  this.value = this.checked;
}