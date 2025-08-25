/**
 * Input validate method
 */

import { validateInput } from './validation';

export function validate(this: any): string | null {
  const state = this.state || this;
  const error = validateInput(state, this.validator);
  if (error) {
    this.emit && this.emit('error', error);
  }
  return error;
}