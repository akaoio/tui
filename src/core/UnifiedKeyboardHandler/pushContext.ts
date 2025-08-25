/**
 * Push a new context onto the stack method
 */

export function pushContext(this: any, context: string): void {
  this.contextStack.push(context)
  this.emit('keyboard:context:push', context)
}