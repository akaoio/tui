/**
 * Reverse text styling
 */

export function reverse(this: any, text: string): string {
  return `\x1b[7m${text}\x1b[27m`;
}