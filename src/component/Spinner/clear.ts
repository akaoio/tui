export function clear(this: any): void {
  if (!this.visible) return;
  const clearLength = (this.frames[0]?.length || 1) + (this.text ? this.text.length + 1 : 0) + 2;
  this.screen.writeAt(this.x, this.y, ' '.repeat(clearLength));
}