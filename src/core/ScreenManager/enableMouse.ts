/**
 * ScreenManager enableMouse method
 */

import { enableMouseTracking } from './mouseHandling';

export function enableMouse(this: any): void {
  if (!this.isMouseEnabled) {
    this.isMouseEnabled = true;
    enableMouseTracking((data) => this.stdout.write(data));
  }
}