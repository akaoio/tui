export enum Color {
  Black = 30,
  Red = 31,
  Green = 32,
  Yellow = 33,
  Blue = 34,
  Magenta = 35,
  Cyan = 36,
  White = 37,
  Default = 39,
  BrightBlack = 90,
  BrightRed = 91,
  BrightGreen = 92,
  BrightYellow = 93,
  BrightBlue = 94,
  BrightMagenta = 95,
  BrightCyan = 96,
  BrightWhite = 97,
}

export enum BgColor {
  Black = 40,
  Red = 41,
  Green = 42,
  Yellow = 43,
  Blue = 44,
  Magenta = 45,
  Cyan = 46,
  White = 47,
  Default = 49,
  BrightBlack = 100,
  BrightRed = 101,
  BrightGreen = 102,
  BrightYellow = 103,
  BrightBlue = 104,
  BrightMagenta = 105,
  BrightCyan = 106,
  BrightWhite = 107,
}

export function rgb(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

export function bgRgb(r: number, g: number, b: number): string {
  return `\x1b[48;2;${r};${g};${b}m`;
}

export function hex(color: string): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return rgb(r, g, b);
}

export function bgHex(color: string): string {
  const hexColor = color.replace('#', '');
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  return bgRgb(r, g, b);
}

export function color(fg?: Color | string, bg?: BgColor | string): string {
  let result = '';
  
  if (fg !== undefined) {
    if (typeof fg === 'string') {
      result += fg.startsWith('#') ? hex(fg) : fg;
    } else {
      result += `\x1b[${fg}m`;
    }
  }
  
  if (bg !== undefined) {
    if (typeof bg === 'string') {
      result += bg.startsWith('#') ? bgHex(bg) : bg;
    } else {
      result += `\x1b[${bg}m`;
    }
  }
  
  return result;
}

export function reset(): string {
  return '\x1b[0m';
}