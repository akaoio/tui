/**
 * Form addComponent method
 */

import { Component } from '../Component';
import { render } from './render';

export function addComponent(this: any, component: Component): void {
  this.components.push(component);
  render.call(this);
}
