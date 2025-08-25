export function select(this: any, index: number): void {
  if (index >= 0 && index < this.options.length && !this.options[index]?.disabled) {
    this.selectedIndex = index;
    this.updateValue();
    this.render();
    this.emit('change', this.value);
  }
}