/**
 * Select getSelectedOptions method
 */

import { SelectOption } from './types';

export function getSelectedOptions(this: any): SelectOption[] {
  return this.selection.getSelectedOptions(this.state);
}