/**
 * Disable output filtering method
 */

export function disable(this: any): void {
  if (!this.enabled) return
  this.enabled = false
  
  process.stdout.write = this.originalWrite
  process.stderr.write = this.originalErrorWrite
}