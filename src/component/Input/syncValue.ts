/**
 * Input syncValue method
 */

export function syncValue(this: any, newValue?: string): void {
  const state = this.state || this;
  
  if (newValue !== undefined) {
    this.value = newValue;
    state.value = newValue;
    this.emit && this.emit('change', newValue);
  } else {
    this.value = state.value;
  }
}