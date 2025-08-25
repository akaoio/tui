/**
 * Select updateValue method
 */

export function updateValue(this: any): void {
  this.value = this.selection.getValue(this.state);
}