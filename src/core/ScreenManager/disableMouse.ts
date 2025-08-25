/**
 * ScreenManager disableMouse method
 */

import { disableMouseTracking } from './mouseHandling';

export function disableMouse(this: any): void {
  if (this.isMouseEnabled) {
    this.isMouseEnabled = false;
    disableMouseTracking((data) => this.stdout.write(data));
  }
}