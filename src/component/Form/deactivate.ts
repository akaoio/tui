/**
 * Form deactivate method
 */

export function deactivate(this: any): void {
  this.isActive = false;
  this.components.forEach((component: any) => component.blur());
}
