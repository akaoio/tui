/**
 * Select previous option method
 */

export function selectPrevious(this: any): void {
  if (!this.options || this.options.length === 0) {
    return;
  }

  const state = this.state || this;
  let prevIndex = (state.selectedIndex || state.hoveredIndex || 0) - 1;
  
  // Skip disabled options
  while (prevIndex >= 0 && this.options[prevIndex]?.disabled) {
    prevIndex--;
  }
  
  // If we reached the beginning, wrap to end
  if (prevIndex < 0) {
    prevIndex = this.options.length - 1;
    while (prevIndex >= 0 && this.options[prevIndex]?.disabled) {
      prevIndex--;
    }
  }
  
  // Only update if we found a valid option
  if (prevIndex >= 0 && !this.options[prevIndex]?.disabled) {
    // Update both for compatibility
    if ('selectedIndex' in state) {
      state.selectedIndex = prevIndex;
    }
    if ('hoveredIndex' in state) {
      state.hoveredIndex = prevIndex;
    }
    this.updateValue && this.updateValue();
    this.emit && this.emit('change', this.value);
  }
}