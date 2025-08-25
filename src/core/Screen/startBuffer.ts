import { ScreenState } from './types';

export function startBuffer(this: any): void {
  if (!this.buffer) {
    this.buffer = [];
  }
  this.buffering = true;
}