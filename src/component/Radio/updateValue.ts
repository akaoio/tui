export function updateValue(this: any): void {
  this.value = this.options[this.selectedIndex]?.value;
}