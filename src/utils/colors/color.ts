/**
 * Main color function
 */

import { Color, BgColor } from './types';
import { hex } from './hex';
import { bgHex } from './bgHex';

// Color name mapping
const colorMap: { [key: string]: number } = {
  'black': 30,
  'red': 31,
  'green': 32,
  'yellow': 33,
  'blue': 34,
  'magenta': 35,
  'cyan': 36,
  'white': 37,
  'brightBlack': 90,
  'brightRed': 91,
  'brightGreen': 92,
  'brightYellow': 93,
  'brightBlue': 94,
  'brightMagenta': 95,
  'brightCyan': 96,
  'brightWhite': 97,
  'bgBlack': 40,
  'bgRed': 41,
  'bgGreen': 42,
  'bgYellow': 43,
  'bgBlue': 44,
  'bgMagenta': 45,
  'bgCyan': 46,
  'bgWhite': 47,
  'bgBrightRed': 101,
  'bgBrightGreen': 102,
  'bgBrightBlue': 104,
};

export function color(this: any, fg?: Color | string, bg?: BgColor | string): string {
  let result = '';
  
  if (fg !== undefined) {
    if (typeof fg === 'string') {
      // Check if it's already an ANSI escape sequence
      if (fg.startsWith('\x1b[')) {
        result += fg;
      } else if (fg.startsWith('#')) {
        result += hex.call(this, fg);
      } else if (colorMap[fg]) {
        result += `\x1b[${colorMap[fg]}m`;
      } else {
        // Unknown color name, skip
        result += '';
      }
    } else {
      result += `\x1b[${fg}m`;
    }
  }
  
  if (bg !== undefined) {
    if (typeof bg === 'string') {
      // Check if it's already an ANSI escape sequence
      if (bg.startsWith('\x1b[')) {
        result += bg;
      } else if (bg.startsWith('#')) {
        result += bgHex(bg);
      } else {
        // It might be a raw color string, skip it to avoid infinite loops
        result += '';
      }
    } else {
      result += `\x1b[${bg}m`;
    }
  }
  
  return result;
}