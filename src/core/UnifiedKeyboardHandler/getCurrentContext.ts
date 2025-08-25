/**
 * Get current context method
 */

export function getCurrentContext(this: any): string {
  return this.contextStack[this.contextStack.length - 1]
}