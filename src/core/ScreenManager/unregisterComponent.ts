/**
 * ScreenManager unregisterComponent method
 */

export function unregisterComponent(this: any, id: string): void {
  this.components.delete(id);
}