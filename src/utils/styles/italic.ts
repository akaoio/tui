/**
 * Italic text styling
 */

export function italic(this: any, text: string): string {
  return `\x1b[3m${text}\x1b[23m`;
}