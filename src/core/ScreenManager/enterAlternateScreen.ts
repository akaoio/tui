/**
 * ScreenManager enterAlternateScreen method
 */

import { ANSI } from './types';

export function enterAlternateScreen(this: any): void {
  if (!this.isAlternateScreen) {
    this.stdout.write(ANSI.alternateScreenEnter);
    this.isAlternateScreen = true;
  }
}