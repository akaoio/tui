/**
 * Form component class (CONTAINER ONLY - no logic)
 */

import { EventEmitter } from 'events';
import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { Component } from '../Component';
import { FormOptions } from './types';
import { constructor } from './constructor';
import { render } from './render';
import { activate } from './activate';
import { deactivate } from './deactivate';
import { getValues } from './getValues';
import { setComponent } from './setComponent';
import { addComponent } from './addComponent';
import { removeComponent } from './removeComponent';
import { clear } from './clear';

export class Form extends EventEmitter {
  public screen!: Screen;
  public keyboard!: Keyboard;
  public title: string = '';
  public components: Component[] = [];
  public currentIndex: number = 0;
  public submitLabel: string = 'Submit';
  public cancelLabel: string = 'Cancel';
  public x: number = 0;
  public y: number = 0;
  public width: number = 50;
  public height: number = 20;
  public isActive: boolean = false;

  constructor(screen: Screen, keyboard: Keyboard, options: FormOptions) {
    super();
    constructor.call(this, screen, keyboard, options);
  }

  render(): void {
    return render.call(this);
  }

  activate(): void {
    return activate.call(this);
  }

  deactivate(): void {
    return deactivate.call(this);
  }

  getValues(): { [key: string]: any } {
    return getValues.call(this);
  }

  setComponent(index: number, component: Component): void {
    return setComponent.call(this, index, component);
  }

  addComponent(component: Component): void {
    return addComponent.call(this, component);
  }

  removeComponent(index: number): void {
    return removeComponent.call(this, index);
  }

  clear(): void {
    return clear.call(this);
  }
}