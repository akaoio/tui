import { WriteStream } from 'tty';
import { ScreenState } from './types';
import { updateDimensions } from './updateDimensions';

export function constructor(this: any, stdout: WriteStream = process.stdout as WriteStream): void {
  this.stdout = stdout;
  this.buffer = null; // Start with null, set to array when buffering starts
  this.width = 80;
  this.height = 24;
  
  updateDimensions.call(this);
  
  if (this.stdout.isTTY) {
    this.stdout.on('resize', () => updateDimensions.call(this));
  }
}