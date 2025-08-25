export function start(this: any): void {
  if (this.isSpinning) return;
  
  this.isSpinning = true;
  this.currentFrame = 0;
  
  this.interval = setInterval(() => {
    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    this.render();
  }, 80);
  
  this.render();
  this.emit('start');
}