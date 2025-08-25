/**
 * Input getError method
 */

export function getError(this: any): string | null {
  return this.state.error || null;
}