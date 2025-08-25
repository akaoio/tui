/**
 * Form cancel method
 */

export function cancel(this: any): void {
  this.emit('cancel');
}
