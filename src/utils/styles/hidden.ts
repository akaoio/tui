/**
 * Hidden text styling
 */

export function hidden(this: any, text: string): string {
  return `\x1b[8m${text}\x1b[28m`;
}