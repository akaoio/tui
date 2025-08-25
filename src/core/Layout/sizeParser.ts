/**
 * Size unit parsing logic
 */

import { SizeUnit } from './types';

/**
 * Parse size unit to absolute value
 */
export function parseSize(this: any, size: SizeUnit,
  parentSize: number,
  totalFractions?: number,
  fractionUnit?: number): number {
  if (typeof size === 'number') {
    return size;
  }
  
  if (typeof size === 'string') {
    if (size === 'auto') {
      return -1;  // Special value for auto
    }
    if (size === 'full') {
      return parentSize;
    }
    if (size === 'half') {
      return Math.floor(parentSize / 2);
    }
    if (size === 'third') {
      return Math.floor(parentSize / 3);
    }
    if (size === 'quarter') {
      return Math.floor(parentSize / 4);
    }
    if (size.endsWith('%')) {
      const percent = parseFloat(size);
      return Math.floor(parentSize * (percent / 100));
    }
    if (size.endsWith('fr') && fractionUnit) {
      const fractions = parseFloat(size);
      return Math.floor(fractions * fractionUnit);
    }
  }
  
  return 0;
}