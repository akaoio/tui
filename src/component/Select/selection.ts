/**
 * Selection logic for Select component
 */

import { SelectOption, SelectState } from './types';

export class SelectionManager {
  constructor(
    private options: SelectOption[],
    private multiple: boolean
  ) {}

  selectCurrent(state: SelectState): { value: any; shouldClose: boolean } {
    const option = this.options[state.hoveredIndex];
    if (!option || option.disabled) {
      return { value: undefined, shouldClose: false };
    }
    
    if (this.multiple) {
      if (state.selectedIndices.has(state.hoveredIndex)) {
        state.selectedIndices.delete(state.hoveredIndex);
      } else {
        state.selectedIndices.add(state.hoveredIndex);
      }
      return { value: this.getValue(state), shouldClose: false };
    } else {
      state.selectedIndex = state.hoveredIndex;
      return { value: this.getValue(state), shouldClose: true };
    }
  }

  getValue(state: SelectState): any {
    if (this.multiple) {
      return Array.from(state.selectedIndices).map((i: any) => this.options[i]?.value);
    } else {
      return this.options[state.selectedIndex]?.value;
    }
  }

  getSelectedOption(state: SelectState): SelectOption | null {
    return this.options[state.selectedIndex] || null;
  }

  getSelectedOptions(state: SelectState): SelectOption[] {
    if (this.multiple) {
      return Array.from(state.selectedIndices)
        .map((i: any) => this.options[i])
        .filter((option): option is SelectOption => option !== undefined);
    }
    const option = this.getSelectedOption(state);
    return option ? [option] : [];
  }

  reset(state: SelectState): void {
    state.selectedIndex = 0;
    state.hoveredIndex = 0;
    state.scrollOffset = 0;
    state.selectedIndices.clear();
  }

  updateOptions(options: SelectOption[]): void {
    this.options = options;
  }
}