/**
 * Bold text styling
 */

export function bold(this: any, text: string): string {
  return `\x1b[1m${text}\x1b[22m`;
}