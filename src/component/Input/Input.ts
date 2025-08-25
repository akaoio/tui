/**
 * Input component class (CONTAINER ONLY - no logic)
 */

import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard, Key, KeyEvent } from '../../core/keyboard';
import { InputOptions, InputState } from './types';
import { constructor as constructorMethod } from './constructor';
import { render } from './render';
import { handleKey } from './handleKey';
import { setValidator } from './setValidator';
import { getError } from './getError';
import { clearError } from './clearError';
import { getValue } from './getValue';
import { setValue } from './setValue';
import { validate } from './validate';

export class Input extends Component {
  public label: string = '';
  public placeholder: string = '';
  public maxLength: number = Infinity;
  public password: boolean = false;
  public multiline: boolean = false;
  public validator?: (value: string) => string | null;
  public state: InputState = {
    value: '',
    cursorPosition: 0,
    scrollOffset: 0,
    lines: [],
    currentLine: 0,
    error: null
  };

  constructor(screen: Screen, keyboard: Keyboard, options: InputOptions = {}) {
    super(screen, keyboard, options);
    constructorMethod.call(this, screen, keyboard, options);
  }

  render(): void {
    return render.call(this);
  }

  handleKey(key: Key, event: KeyEvent): void {
    return handleKey.call(this, key, event);
  }

  setValidator(validator: (value: string) => string | null): void {
    return setValidator.call(this, validator);
  }

  getError(): string | null {
    return getError.call(this);
  }

  clearError(): void {
    return clearError.call(this);
  }

  override getValue(): string {
    return getValue.call(this);
  }

  override setValue(value: string): void {
    return setValue.call(this, value);
  }

  validate(): string | null {
    return validate.call(this);
  }
}