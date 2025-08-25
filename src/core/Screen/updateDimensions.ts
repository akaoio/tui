import { ScreenState } from './types';

export function updateDimensions(this: any): void {
  if (this.stdout.isTTY) {
    this.width = this.stdout.columns || 80;
    this.height = this.stdout.rows || 24;
  }
}