/**
 * Hex color function
 */

import { rgb } from './rgb';

export function hex(this: any, color: string): string {
  if (!color || typeof color !== 'string') {
    return rgb.call(this, 0, 0, 0);
  }
  let hex = color.replace('#', '').replace('0x', '').replace('0X', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Validate hex
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return `\x1b[38;2;0;0;0m`; // Default to black
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return rgb.call(this, r, g, b);
}