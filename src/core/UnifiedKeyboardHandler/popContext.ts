/**
 * Pop the current context from the stack method
 */

export function popContext(this: any): string | undefined {
  if (this.contextStack.length > 1) {
    const context = this.contextStack.pop()
    this.emit('keyboard:context:pop', context)
    return context
  }
  return undefined
}