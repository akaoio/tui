/**
 * Set input value method
 */

export function setValue(this: any, value: string): void {
  this.state.value = value || '';
  this.state.cursorPosition = Math.min(this.state.cursorPosition, (value || '').length);
}