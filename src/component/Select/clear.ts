/**
 * Select clear method
 */

export function clear(this: any): void {
  const width = this.width || 30;
  this.renderer.clearArea(this.x, this.y, width, this.height);
}