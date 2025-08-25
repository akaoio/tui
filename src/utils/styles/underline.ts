/**
 * Underline text styling
 */

export function underline(this: any, text: string): string {
  return `\x1b[4m${text}\x1b[24m`;
}