import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard, Key, KeyEvent } from '../../core/keyboard';
import { RadioOptions, RadioOption } from './types';
import { constructor } from './constructor';
import { render } from './render';
import { renderVertical } from './renderVertical';
import { renderHorizontal } from './renderHorizontal';
import { handleKey } from './handleKey';
import { selectNext } from './selectNext';
import { selectPrevious } from './selectPrevious';
import { selectFirst } from './selectFirst';
import { selectLast } from './selectLast';
import { updateValue } from './updateValue';
import { select } from './select';
import { selectByValue } from './selectByValue';
import { getSelectedOption } from './getSelectedOption';

export class Radio extends Component {
  private options!: RadioOption[];
  private selectedIndex!: number;
  private orientation!: 'horizontal' | 'vertical';

  constructor(screen: Screen, keyboard: Keyboard, options: RadioOptions) {
    super(screen, keyboard, options);
    constructor.call(this, screen, keyboard, options);
  }

  render(): void {
    return render.call(this);
  }

  private renderVertical(): void {
    return renderVertical.call(this);
  }

  private renderHorizontal(): void {
    return renderHorizontal.call(this);
  }

  handleKey(key: Key, event: KeyEvent): void {
    return handleKey.call(this, key, event);
  }

  private selectNext(): void {
    return selectNext.call(this);
  }

  private selectPrevious(): void {
    return selectPrevious.call(this);
  }

  private selectFirst(): void {
    return selectFirst.call(this);
  }

  private selectLast(): void {
    return selectLast.call(this);
  }

  private updateValue(): void {
    return updateValue.call(this);
  }

  select(index: number): void {
    return select.call(this, index);
  }

  selectByValue(value: any): void {
    return selectByValue.call(this, value);
  }

  getSelectedOption(): RadioOption | null {
    return getSelectedOption.call(this);
  }
}