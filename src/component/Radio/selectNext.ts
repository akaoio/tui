export function selectNext(this: any): void {
  if (!this.options || this.options.length === 0) {
    return;
  }
  
  let nextIndex = this.selectedIndex;
  do {
    nextIndex = (nextIndex + 1) % this.options.length;
  } while (this.options[nextIndex]?.disabled && nextIndex !== this.selectedIndex);
  
  if (nextIndex !== this.selectedIndex && !this.options[nextIndex]?.disabled) {
    this.selectedIndex = nextIndex;
    this.updateValue();
    this.emit('change', this.value);
  }
}