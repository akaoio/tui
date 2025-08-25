/**
 * Select render method
 */

export function render(this: any): void {
  if (!this.visible) return;

  const width = this.width || 30;

  if (this.focused && this.state.isOpen) {
    const height = this.renderer.renderOpen(
      this.x,
      this.y,
      width,
      this.options,
      this.state,
      this.maxDisplay,
      this.multiple
    );
    this.height = height;
  } else {
    this.renderer.renderClosed(
      this.x,
      this.y,
      width,
      this.options,
      this.state,
      this.focused
    );
  }
}