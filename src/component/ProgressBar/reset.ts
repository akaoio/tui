export function reset(this: any): void {
  if (this.setProgress) {
    this.setProgress(0);
  } else {
    // Direct implementation for testing
    this.current = 0;
    this.value = 0.0;
    this.render && this.render();
    this.emit && this.emit('reset');
  }
}