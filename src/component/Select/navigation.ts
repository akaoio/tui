/**
 * Navigation logic for Select component
 */

import { SelectOption, SelectState } from './types';

export class SelectNavigation {
  constructor(
    private options: SelectOption[],
    private maxDisplay: number
  ) {}

  moveUp(state: SelectState): void {
    do {
      state.hoveredIndex = Math.max(0, state.hoveredIndex - 1);
    } while (state.hoveredIndex > 0 && this.options[state.hoveredIndex]?.disabled);
    
    this.updateScroll(state);
  }

  moveDown(state: SelectState): void {
    do {
      state.hoveredIndex = Math.min(this.options.length - 1, state.hoveredIndex + 1);
    } while (state.hoveredIndex < this.options.length - 1 && this.options[state.hoveredIndex]?.disabled);
    
    this.updateScroll(state);
  }

  moveToStart(state: SelectState): void {
    state.hoveredIndex = 0;
    state.scrollOffset = 0;
  }

  moveToEnd(state: SelectState): void {
    state.hoveredIndex = this.options.length - 1;
    this.updateScroll(state);
  }

  pageUp(state: SelectState): void {
    state.hoveredIndex = Math.max(0, state.hoveredIndex - this.maxDisplay);
    this.updateScroll(state);
  }

  pageDown(state: SelectState): void {
    state.hoveredIndex = Math.min(this.options.length - 1, state.hoveredIndex + this.maxDisplay);
    this.updateScroll(state);
  }

  private updateScroll(state: SelectState): void {
    if (state.hoveredIndex < state.scrollOffset) {
      state.scrollOffset = state.hoveredIndex;
    } else if (state.hoveredIndex >= state.scrollOffset + this.maxDisplay) {
      state.scrollOffset = state.hoveredIndex - this.maxDisplay + 1;
    }
  }

  updateOptions(options: SelectOption[]): void {
    this.options = options;
  }
}