/**
 * Background hex color function
 */

import { bgRgb } from './bgRgb';

export function bgHex(this: any, color: string): string {
  const hexColor = color.replace('#', '');
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  return bgRgb(r, g, b);
}