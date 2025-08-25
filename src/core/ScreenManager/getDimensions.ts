/**
 * ScreenManager getDimensions method
 */

import { ScreenDimensions } from './types';

export function getDimensions(this: any): ScreenDimensions {
  return { width: this.width, height: this.height };
}