import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard, Key, KeyEvent } from '../../core/keyboard';
import { CheckboxOptions } from './types';
import { constructor } from './constructor';
import { render } from './render';
import { handleKey } from './handleKey';
import { toggle } from './toggle';
import { check } from './check';
import { uncheck } from './uncheck';
import { isChecked } from './isChecked';
import { setDisabled } from './setDisabled';
import { isDisabled } from './isDisabled';

export class Checkbox extends Component {
  private label!: string;
  private checked!: boolean;
  private disabled!: boolean;

  constructor(screen: Screen, keyboard: Keyboard, options: CheckboxOptions) {
    super(screen, keyboard, options);
    constructor.call(this, screen, keyboard, options);
  }

  render(): void {
    return render.call(this);
  }

  handleKey(key: Key, event: KeyEvent): void {
    return handleKey.call(this, key, event);
  }

  toggle(): void {
    return toggle.call(this);
  }

  check(): void {
    return check.call(this);
  }

  uncheck(): void {
    return uncheck.call(this);
  }

  isChecked(): boolean {
    return isChecked.call(this);
  }

  setDisabled(disabled: boolean): void {
    return setDisabled.call(this, disabled);
  }

  isDisabled(): boolean {
    return isDisabled.call(this);
  }
}