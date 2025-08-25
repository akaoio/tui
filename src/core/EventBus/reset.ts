/**
 * Reset the EventBus method
 */

export function reset(this: any): void {
  this.handlers.clear();
  this.wildcardHandlers.clear();
  this.channelHandlers.clear();
  this.eventHistory = [];
  this.removeAllListeners();
}