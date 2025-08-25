export function render(this: any): void {
  if (!this.visible) return;

  if (this.orientation === 'vertical') {
    this.renderVertical();
  } else {
    this.renderHorizontal();
  }
}