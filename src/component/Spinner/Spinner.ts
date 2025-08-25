import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard, Key, KeyEvent } from '../../core/keyboard';
import { Color } from '../../utils/colors';
import { SpinnerOptions } from './types';
import { constructor } from './constructor';
import { getFrames } from './getFrames';
import { render } from './render';
import { start } from './start';
import { stop } from './stop';
import { succeed } from './succeed';
import { fail } from './fail';
import { warn } from './warn';
import { info } from './info';
import { setText } from './setText';
import { setStyle } from './setStyle';
import { handleKey } from './handleKey';
import { clear } from './clear';

export class Spinner extends Component {
  public text!: string;
  public style!: string;
  public frames!: string[];
  public frameIndex!: number;
  public interval!: number;
  private intervalId!: NodeJS.Timeout | null;
  public spinnerColor!: Color;
  public isSpinning!: boolean;

  constructor(screen: Screen, keyboard: Keyboard, options: SpinnerOptions = {}) {
    super(screen, keyboard, options);
    constructor.call(this, screen, keyboard, options);
  }

  getFrames(style?: string): string[] {
    return getFrames.call(this, style || this.style);
  }

  render(): void {
    return render.call(this);
  }

  start(): void {
    return start.call(this);
  }

  stop(): void {
    return stop.call(this);
  }

  succeed(text?: string): void {
    return succeed.call(this, text);
  }

  fail(text?: string): void {
    return fail.call(this, text);
  }

  warn(text?: string): void {
    return warn.call(this, text);
  }

  info(text?: string): void {
    return info.call(this, text);
  }

  setText(text: string): void {
    return setText.call(this, text);
  }

  setStyle(style: 'dots' | 'line' | 'circle' | 'square' | 'arrow' | 'pulse'): void {
    return setStyle.call(this, style);
  }

  handleKey(key: Key, event: KeyEvent): void {
    return handleKey.call(this, key, event);
  }

  override clear(): void {
    return clear.call(this);
  }
}