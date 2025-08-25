/**
 * Destroy and cleanup method
 */

export function destroy(this: any): void {
  this.keyboard.removeAllListeners()
  this.removeAllListeners()
  this.bindings.clear()
  this.globalBindings = []
  this.contextStack = ['global']
}