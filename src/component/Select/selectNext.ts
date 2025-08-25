/**
 * Select next option method
 */

export function selectNext(this: any): void {
  if (!this.options || this.options.length === 0) {
    return;
  }

  const state = this.state || this;
  let nextIndex = (state.selectedIndex || state.hoveredIndex || 0) + 1;
  
  // Skip disabled options
  while (nextIndex < this.options.length && this.options[nextIndex]?.disabled) {
    nextIndex++;
  }
  
  // If we reached the end, wrap to beginning
  if (nextIndex >= this.options.length) {
    nextIndex = 0;
    while (nextIndex < this.options.length && this.options[nextIndex]?.disabled) {
      nextIndex++;
    }
  }
  
  // Only update if we found a valid option
  if (nextIndex < this.options.length && !this.options[nextIndex]?.disabled) {
    // Update both for compatibility
    if ('selectedIndex' in state) {
      state.selectedIndex = nextIndex;
    }
    if ('hoveredIndex' in state) {
      state.hoveredIndex = nextIndex;
    }
    this.updateValue && this.updateValue();
    this.emit && this.emit('change', this.value);
  }
}