/**
 * Select setOptions method
 */

import { SelectOption } from './types';
import { updateValue } from './updateValue';
import { render } from './render';

export function setOptions(this: any, options: SelectOption[]): void {
  this.options = options;
  this.navigation.updateOptions(options);
  this.selection.updateOptions(options);
  this.selection.reset(this.state);
  updateValue.call(this);
  render.call(this);
}