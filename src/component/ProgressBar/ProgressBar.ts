import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard, Key, KeyEvent } from '../../core/keyboard';
import { Color } from '../../utils/colors';
import { ProgressBarOptions } from './types';
import { constructor } from './constructor';
import { render } from './render';
import { handleKey } from './handleKey';
import { getPercentage } from './getPercentage';
import { setProgress } from './setProgress';
import { increment } from './increment';
import { decrement } from './decrement';
import { reset } from './reset';
import { complete } from './complete';
import { setTotal } from './setTotal';
import { getCurrent } from './getCurrent';
import { getTotal } from './getTotal';

export class ProgressBar extends Component {
  public total!: number;
  public current!: number;
  public showPercentage!: boolean;
  public showNumbers!: boolean;
  public barWidth!: number;
  public completeChar!: string;
  public incompleteChar!: string;
  public barColor!: Color;

  constructor(screen: Screen, keyboard: Keyboard, options: ProgressBarOptions) {
    super(screen, keyboard, options);
    constructor.call(this, screen, keyboard, options);
  }

  render(): void {
    return render.call(this);
  }

  handleKey(key: Key, event: KeyEvent): void {
    return handleKey.call(this, key, event);
  }

  getPercentage(): number {
    return getPercentage.call(this);
  }

  setProgress(current: number): void {
    return setProgress.call(this, current);
  }

  increment(amount: number = 1): void {
    return increment.call(this, amount);
  }

  decrement(amount: number = 1): void {
    return decrement.call(this, amount);
  }

  reset(): void {
    return reset.call(this);
  }

  complete(): void {
    return complete.call(this);
  }

  setTotal(total: number): void {
    return setTotal.call(this, total);
  }

  getCurrent(): number {
    return getCurrent.call(this);
  }

  getTotal(): number {
    return getTotal.call(this);
  }
}