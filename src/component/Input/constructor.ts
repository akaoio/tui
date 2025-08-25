/**
 * Input constructor logic
 */

import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { InputOptions, InputState } from './types';

export function constructor(
  this: any,
  screenOrOptions?: Screen | InputOptions, 
  keyboard?: Keyboard, 
  options?: InputOptions
): void {
  // Handle flexible parameters for testing
  let actualOptions: InputOptions;
  if (screenOrOptions && !keyboard && !options) {
    // Only one parameter passed - assume it's options
    actualOptions = screenOrOptions as InputOptions;
  } else {
    actualOptions = options || {};
  }
  // Initialize properties (super() already called in class constructor)
  this.label = actualOptions.label || '';
  this.placeholder = actualOptions.placeholder || '';
  this.value = actualOptions.value || '';
  this.maxLength = actualOptions.maxLength || Infinity;
  this.password = actualOptions.password || false;
  this.multiline = actualOptions.multiline || false;
  this.validator = actualOptions.validator;
  
  this.state = {
    value: this.value,
    cursorPosition: this.value.length,
    scrollOffset: 0,
    lines: [],
    currentLine: 0,
    error: null
  };
  
  if (this.multiline) {
    this.state.lines = this.value ? this.value.split('\n') : [''];
    this.state.currentLine = this.state.lines.length - 1;
    this.height = Math.max(3, actualOptions.height || 5);
  } else {
    this.state.lines = [this.value];
    this.state.currentLine = 0;
    this.height = 1;
  }
}