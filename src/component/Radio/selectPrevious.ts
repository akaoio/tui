export function selectPrevious(this: any): void {
  if (!this.options || this.options.length === 0) {
    return;
  }
  
  let prevIndex = this.selectedIndex;
  do {
    prevIndex = prevIndex === 0 ? this.options.length - 1 : prevIndex - 1;
  } while (this.options[prevIndex]?.disabled && prevIndex !== this.selectedIndex);
  
  if (prevIndex !== this.selectedIndex && !this.options[prevIndex]?.disabled) {
    this.selectedIndex = prevIndex;
    this.updateValue();
    this.emit('change', this.value);
  }
}