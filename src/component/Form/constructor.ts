/**
 * Form constructor logic
 */

import { EventEmitter } from 'events';
import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { FormOptions } from './types';
import { setupKeyboardHandlers } from './setupKeyboardHandlers';

export function constructor(
  this: any,
  screen: Screen,
  keyboard: Keyboard,
  options: FormOptions
): void {
  EventEmitter.call(this);
  
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
  
  setupKeyboardHandlers.call(this);
}