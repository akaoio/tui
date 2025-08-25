export function selectLast(this: any): void {
  for (let i = this.options.length - 1; i >= 0; i--) {
    if (!this.options[i]?.disabled) {
      if (this.selectedIndex !== i) {
        this.selectedIndex = i;
        this.updateValue();
        this.emit('change', this.value);
      }
      break;
    }
  }
}