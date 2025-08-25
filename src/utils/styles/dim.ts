/**
 * Dim text styling
 */

export function dim(this: any, text: string): string {
  return `\x1b[2m${text}\x1b[22m`;
}