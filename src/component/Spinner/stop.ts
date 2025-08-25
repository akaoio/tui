export function stop(this: any): void {
  if (!this.isSpinning) return;
  
  this.isSpinning = false;
  
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = null;
  }
  
  this.clear();
  this.emit('stop');
}