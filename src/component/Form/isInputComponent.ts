/**
 * Form isInputComponent method
 */

import { Component } from '../Component';

export function isInputComponent(this: any, component: Component): boolean {
  // Check if component is an Input or Select (which handle UP/DOWN internally)
  return component.constructor.name === 'Input' || 
         component.constructor.name === 'Select';
}
