/**
 * Background RGB color function
 */

export function bgRgb(this: any, r: number, g: number, b: number): string {
  return `\x1b[48;2;${r};${g};${b}m`;
}