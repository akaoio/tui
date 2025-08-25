/**
 * ScreenManager exitAlternateScreen method
 */

import { ANSI } from './types';

export function exitAlternateScreen(this: any): void {
  if (this.isAlternateScreen) {
    this.stdout.write(ANSI.alternateScreenExit);
    this.isAlternateScreen = false;
  }
}