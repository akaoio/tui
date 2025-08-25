/**
 * Select clearSelection method - clears the current selection
 */

export function clearSelection(this: any): void {
  this.state.selectedIndex = -1;
  this.state.hoveredIndex = 0;
  this.state.selectedIndices.clear();
  this.value = this.multiple ? [] : undefined;
  this.emit('change', this.value);
}