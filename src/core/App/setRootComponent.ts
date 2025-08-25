/**
 * Set root component method
 */

import { Component } from '../Component'

export function setRootComponent(this: any, component: Component): void {
  this.rootComponent = component
  this.focusManager.setRoot(component)
}