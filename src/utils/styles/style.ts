/**
 * Basic style function
 */

import { Style } from './types';

const styleMap: { [key: string]: number } = {
  'bold': Style.Bold,
  'dim': Style.Dim,
  'italic': Style.Italic,
  'underline': Style.Underline,
  'blink': Style.Blink,
  'reverse': Style.Reverse,
  'hidden': Style.Hidden,
  'strikethrough': Style.Strikethrough,
};

export function style(this: any, text: string, styles: string[] = []): string {
  if (styles.length === 0) {
    return text;
  }
  
  const validStyles = styles.filter(s => styleMap[s]).map(s => styleMap[s]);
  if (validStyles.length === 0) {
    return text;
  }
  
  const styleCodes = validStyles.map(s => `\x1b[${s}m`).join('');
  return `${styleCodes}${text}\x1b[0m`;
}