import { Component, ComponentOptions } from './Component';
import { Screen } from '../core/screen';
import { Keyboard, Key, KeyEvent } from '../core/keyboard';
import { Color, color, reset } from '../utils/colors';

export interface SpinnerOptions extends ComponentOptions {
  text?: string;
  style?: 'dots' | 'line' | 'circle' | 'square' | 'arrow' | 'pulse';
  color?: Color;
}

export class Spinner extends Component {
  private text: string;
  private style: string;
  private frames: string[];
  private currentFrame: number;
  private interval: NodeJS.Timeout | null;
  private spinnerColor: Color;
  private isSpinning: boolean;

  constructor(screen: Screen, keyboard: Keyboard, options: SpinnerOptions = {}) {
    super(screen, keyboard, options);
    this.text = options.text || '';
    this.style = options.style || 'dots';
    this.spinnerColor = options.color || Color.Cyan;
    this.currentFrame = 0;
    this.interval = null;
    this.isSpinning = false;
    
    this.frames = this.getFrames(this.style);
  }

  private getFrames(style: string): string[] {
    const styles: Record<string, string[]> = {
      dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      line: ['-', '\\', '|', '/'],
      circle: ['◜', '◠', '◝', '◞', '◡', '◟'],
      square: ['◰', '◳', '◲', '◱'],
      arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
      pulse: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
    };
    
    return styles[style] ?? styles.dots;
  }

  render(): void {
    if (!this.visible || !this.isSpinning) return;
    
    const frame = this.frames[this.currentFrame];
    let output = color(this.spinnerColor) + frame + reset();
    
    if (this.text) {
      output += ' ' + this.text;
    }
    
    this.screen.writeAt(this.x, this.y, output + '  ');
  }

  start(): void {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.currentFrame = 0;
    
    this.interval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.render();
    }, 80);
    
    this.render();
    this.emit('start');
  }

  stop(): void {
    if (!this.isSpinning) return;
    
    this.isSpinning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.clear();
    this.emit('stop');
  }

  succeed(text?: string): void {
    this.stop();
    const successText = color(Color.Green) + '✓' + reset() + ' ' + (text || this.text);
    this.screen.writeAt(this.x, this.y, successText);
    this.emit('succeed', text);
  }

  fail(text?: string): void {
    this.stop();
    const failText = color(Color.Red) + '✗' + reset() + ' ' + (text || this.text);
    this.screen.writeAt(this.x, this.y, failText);
    this.emit('fail', text);
  }

  warn(text?: string): void {
    this.stop();
    const warnText = color(Color.Yellow) + '⚠' + reset() + ' ' + (text || this.text);
    this.screen.writeAt(this.x, this.y, warnText);
    this.emit('warn', text);
  }

  info(text?: string): void {
    this.stop();
    const infoText = color(Color.Blue) + 'ℹ' + reset() + ' ' + (text || this.text);
    this.screen.writeAt(this.x, this.y, infoText);
    this.emit('info', text);
  }

  setText(text: string): void {
    this.text = text;
    this.render();
  }

  setStyle(style: 'dots' | 'line' | 'circle' | 'square' | 'arrow' | 'pulse'): void {
    this.style = style;
    this.frames = this.getFrames(style);
    this.currentFrame = 0;
    this.render();
  }

  handleKey(_key: Key, _event: KeyEvent): void {
    // Spinner doesn't handle keyboard input
  }

  override clear(): void {
    if (!this.visible) return;
    const clearLength = (this.frames[0]?.length || 1) + (this.text ? this.text.length + 1 : 0) + 2;
    this.screen.writeAt(this.x, this.y, ' '.repeat(clearLength));
  }
}