/**
 * Select getSelectedOption method
 */

import { SelectOption } from './types';

export function getSelectedOption(this: any): SelectOption | null {
  const state = this.state || this;
  const selectedIndex = state.selectedIndex || state.hoveredIndex || 0;
  
  if (this.options && selectedIndex >= 0 && selectedIndex < this.options.length) {
    return this.options[selectedIndex];
  }
  
  return null;
}