/**
 * Blink text styling
 */

export function blink(this: any, text: string): string {
  return `\x1b[5m${text}\x1b[25m`;
}