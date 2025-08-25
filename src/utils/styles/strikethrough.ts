/**
 * Strikethrough text styling
 */

export function strikethrough(this: any, text: string): string {
  return `\x1b[9m${text}\x1b[29m`;
}