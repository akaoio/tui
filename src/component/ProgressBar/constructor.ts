import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { Color } from '../../utils/colors';
import { ProgressBarOptions } from './types';

export function constructor(this: any, screen: Screen, keyboard: Keyboard, options: ProgressBarOptions) {
  // Parent constructor is already called in container class
  
  this.total = options.total;
  this.current = options.current || 0;
  this.showPercentage = options.showPercentage !== false;
  this.showNumbers = options.showNumbers || false;
  this.barWidth = options.barWidth || 30;
  this.completeChar = options.completeChar || '█';
  this.incompleteChar = options.incompleteChar || '░';
  this.barColor = options.barColor || Color.Green;
  this.value = this.getPercentage();
}