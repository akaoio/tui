/**
 * Form setComponent method
 */

import { Component } from '../Component';
import { render } from './render';

export function setComponent(this: any, index: number, component: Component): void {
  if (index >= 0 && index < this.components.length) {
    this.components[index] = component;
    render.call(this);
  }
}
