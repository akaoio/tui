/**
 * EventBus constructor method
 */

export function constructor(this: any): any {
  this.setMaxListeners(0); // Unlimited listeners
}