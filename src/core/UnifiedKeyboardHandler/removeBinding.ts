/**
 * Remove a key binding method
 */

export function removeBinding(this: any, key: string, context: string = 'global'): void {
  if (context === 'global') {
    this.globalBindings = this.globalBindings.filter((b: any) => b.key !== key)
  } else {
    const contextBindings = this.bindings.get(context)
    if (contextBindings) {
      this.bindings.set(context, contextBindings.filter((b: any) => b.key !== key))
    }
  }
}