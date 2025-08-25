/**
 * Clear all bindings for a context method
 */

export function clearBindings(this: any, context: string = 'global'): void {
  if (context === 'global') {
    this.globalBindings = []
  } else {
    this.bindings.delete(context)
  }
}