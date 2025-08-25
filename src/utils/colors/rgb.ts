/**
 * RGB color function
 */

export function rgb(this: any, r: number, g: number, b: number): string {
  const clampedR = Math.max(0, Math.min(255, Math.round(isNaN(r) ? 0 : r)));
  const clampedG = Math.max(0, Math.min(255, Math.round(isNaN(g) ? 0 : g)));
  const clampedB = Math.max(0, Math.min(255, Math.round(isNaN(b) ? 0 : b)));
  return `\x1b[38;2;${clampedR};${clampedG};${clampedB}m`;
}