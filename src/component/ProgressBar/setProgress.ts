export function setProgress(this: any, current: number): void {
  this.current = Math.min(this.total || 100, Math.max(0, current));
  
  if (this.getPercentage) {
    this.value = this.getPercentage();
  } else {
    // Direct calculation for testing
    this.value = this.current / (this.total || 100);
  }
  
  this.render && this.render();
  this.emit && this.emit('progress', this.current, this.total, this.value);
  
  if (this.current >= (this.total || 100)) {
    this.emit && this.emit('complete');
  }
}