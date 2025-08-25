/**
 * ScreenManager registerComponent method
 */

export function registerComponent(
  this: any,
  id: string, 
  component: any, 
  region: any
): void {
  this.components.set(id, { component, region });
}