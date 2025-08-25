/**
 * Input clearError method
 */

import { clearError as clearErrorFromState } from './validation';
import { render } from './render';

export function clearError(this: any): void {
  clearErrorFromState(this.state);
  render.call(this);
}