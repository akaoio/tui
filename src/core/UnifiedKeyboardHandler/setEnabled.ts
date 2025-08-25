/**
 * Enable/disable keyboard handling method
 */

export function setEnabled(this: any, enabled: boolean): void {
  this.enabled = enabled
  this.emit('keyboard:enabled', enabled)
}