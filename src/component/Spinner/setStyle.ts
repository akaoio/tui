export function setStyle(this: any, style: 'dots' | 'line' | 'circle' | 'square' | 'arrow' | 'pulse'): void {
  this.style = style;
  this.frames = this.getFrames(style);
  this.currentFrame = 0;
  this.render();
}