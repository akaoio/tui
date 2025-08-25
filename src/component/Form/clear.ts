/**
 * Form clear method
 */

export function clear(this: any): void {
  for (let i = 0; i < this.height; i++) {
    this.screen.writeAt(this.x, this.y + i, ' '.repeat(this.width));
  }
}
