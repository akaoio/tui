/**
 * Text truncation function
 */

export function truncate(this: any, text: string, maxWidth: number, suffix: string = '...'): string {
  if (text.length <= maxWidth) return text;
  return text.substring(0, maxWidth - suffix.length) + suffix;
}