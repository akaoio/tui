import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { Color } from '../../utils/colors';
import { SpinnerOptions } from './types';

export function constructor(this: any, screen: Screen, keyboard: Keyboard, options: SpinnerOptions = {}) {
  // Parent constructor is already called in container class
  
  this.text = options.text || '';
  this.style = options.style || 'dots';
  this.spinnerColor = options.color || Color.Cyan;
  this.currentFrame = 0;
  this.interval = null;
  this.isSpinning = false;
  
  this.frames = this.getFrames(this.style);
}