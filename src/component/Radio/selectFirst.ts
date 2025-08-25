export function selectFirst(this: any): void {
  for (let i = 0; i < this.options.length; i++) {
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