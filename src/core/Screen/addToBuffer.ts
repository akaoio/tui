import { ScreenState } from './types';

export function addToBuffer(this: any, text: string): void {
  this.buffer.push(text);
}