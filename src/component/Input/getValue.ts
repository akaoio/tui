/**
 * Get input value method
 */

export function getValue(this: any): string {
  return this.state.value || '';
}