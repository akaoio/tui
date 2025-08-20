import { Component, ComponentOptions } from './Component';
import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { Color, color, reset, BgColor } from '../utils/colors';

export interface ProgressBarOptions extends ComponentOptions {
  total: number;
  current?: number;
  showPercentage?: boolean;
  showNumbers?: boolean;
  barWidth?: number;
  completeChar?: string;
  incompleteChar?: string;
  barColor?: Color;
  bgColor?: BgColor;
}

export class ProgressBar extends Component {
  private total: number;
  private current: number;
  private showPercentage: boolean;
  private showNumbers: boolean;
  private barWidth: number;
  private completeChar: string;
  private incompleteChar: string;
  private barColor: Color;
  private bgColor: BgColor;

  constructor(screen: Screen, keyboard: Keyboard, options: ProgressBarOptions) {
    super(screen, keyboard, options);
    this.total = options.total;
    this.current = options.current || 0;
    this.showPercentage = options.showPercentage !== false;
    this.showNumbers = options.showNumbers || false;
    this.barWidth = options.barWidth || 30;
    this.completeChar = options.completeChar || '█';
    this.incompleteChar = options.incompleteChar || '░';
    this.barColor = options.barColor || Color.Green;
    this.bgColor = options.bgColor || BgColor.Default;
    this.value = this.getPercentage();
  }

  render(): void {
    if (!this.visible) return;

    const percentage = this.getPercentage();
    const filled = Math.floor((this.barWidth * percentage) / 100);
    const empty = this.barWidth - filled;
    
    let output = '';
    
    // Draw the progress bar
    output += '[';
    output += color(this.barColor) + this.completeChar.repeat(filled) + reset();
    output += this.incompleteChar.repeat(empty);
    output += ']';
    
    // Add percentage if enabled
    if (this.showPercentage) {
      output += ` ${percentage}%`;
    }
    
    // Add numbers if enabled
    if (this.showNumbers) {
      output += ` (${this.current}/${this.total})`;
    }
    
    this.screen.writeAt(this.x, this.y, output);
  }

  handleKey(key: Key, event: KeyEvent): void {
    // ProgressBar doesn't handle keyboard input
  }

  getPercentage(): number {
    if (this.total === 0) return 0;
    return Math.min(100, Math.floor((this.current / this.total) * 100));
  }

  setProgress(current: number): void {
    this.current = Math.min(this.total, Math.max(0, current));
    this.value = this.getPercentage();
    this.render();
    this.emit('progress', this.current, this.total, this.value);
    
    if (this.current >= this.total) {
      this.emit('complete');
    }
  }

  increment(amount: number = 1): void {
    this.setProgress(this.current + amount);
  }

  decrement(amount: number = 1): void {
    this.setProgress(this.current - amount);
  }

  reset(): void {
    this.setProgress(0);
  }

  complete(): void {
    this.setProgress(this.total);
  }

  setTotal(total: number): void {
    this.total = total;
    if (this.current > this.total) {
      this.current = this.total;
    }
    this.value = this.getPercentage();
    this.render();
  }

  getCurrent(): number {
    return this.current;
  }

  getTotal(): number {
    return this.total;
  }
}