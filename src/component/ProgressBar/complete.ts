export function complete(this: any): void {
  const total = this.total !== undefined ? this.total : 100;
  
  if (this.setProgress) {
    this.setProgress(total);
  } else {
    // Direct implementation for testing
    this.current = total;
    this.value = total === 0 ? 0 : 1.0;
    this.render && this.render();
    this.emit && this.emit('progress', this.current, total, this.current);
    this.emit && this.emit('complete');
  }
}