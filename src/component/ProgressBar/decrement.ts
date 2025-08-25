export function decrement(this: any, amount: number = 1): void {
  const newCurrent = (this.current || 0) - amount;
  
  if (this.setProgress) {
    this.setProgress(newCurrent);
  } else {
    // Direct implementation for testing
    this.current = Math.min(this.total || 100, Math.max(0, newCurrent));
    this.value = this.current / (this.total || 100);
    this.render && this.render();
    this.emit && this.emit('progress', this.current, this.total, this.value);
    
    if (this.current >= (this.total || 100)) {
      this.emit && this.emit('complete');
    }
  }
}