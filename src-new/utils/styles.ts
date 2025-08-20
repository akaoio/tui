export enum Style {
  Reset = 0,
  Bold = 1,
  Dim = 2,
  Italic = 3,
  Underline = 4,
  Blink = 5,
  Reverse = 7,
  Hidden = 8,
  Strikethrough = 9,
}

export function style(...styles: Style[]): string {
  return styles.map(s => `\x1b[${s}m`).join('');
}

export function bold(text: string): string {
  return `\x1b[1m${text}\x1b[22m`;
}

export function dim(text: string): string {
  return `\x1b[2m${text}\x1b[22m`;
}

export function italic(text: string): string {
  return `\x1b[3m${text}\x1b[23m`;
}

export function underline(text: string): string {
  return `\x1b[4m${text}\x1b[24m`;
}

export function blink(text: string): string {
  return `\x1b[5m${text}\x1b[25m`;
}

export function reverse(text: string): string {
  return `\x1b[7m${text}\x1b[27m`;
}

export function hidden(text: string): string {
  return `\x1b[8m${text}\x1b[28m`;
}

export function strikethrough(text: string): string {
  return `\x1b[9m${text}\x1b[29m`;
}

export interface BoxStyle {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  cross: string;
  horizontalDown: string;
  horizontalUp: string;
  verticalLeft: string;
  verticalRight: string;
}

export const BoxStyles = {
  Single: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    cross: '┼',
    horizontalDown: '┬',
    horizontalUp: '┴',
    verticalLeft: '┤',
    verticalRight: '├',
  },
  Double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
    cross: '╬',
    horizontalDown: '╦',
    horizontalUp: '╩',
    verticalLeft: '╣',
    verticalRight: '╠',
  },
  Rounded: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    cross: '┼',
    horizontalDown: '┬',
    horizontalUp: '┴',
    verticalLeft: '┤',
    verticalRight: '├',
  },
  Bold: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃',
    cross: '╋',
    horizontalDown: '┳',
    horizontalUp: '┻',
    verticalLeft: '┫',
    verticalRight: '┣',
  },
  ASCII: {
    topLeft: '+',
    topRight: '+',
    bottomLeft: '+',
    bottomRight: '+',
    horizontal: '-',
    vertical: '|',
    cross: '+',
    horizontalDown: '+',
    horizontalUp: '+',
    verticalLeft: '+',
    verticalRight: '+',
  },
};

export function drawBox(
  width: number,
  height: number,
  style: BoxStyle = BoxStyles.Single
): string[] {
  const lines: string[] = [];
  
  const topLine = style.topLeft + style.horizontal.repeat(width - 2) + style.topRight;
  lines.push(topLine);
  
  for (let i = 0; i < height - 2; i++) {
    const middleLine = style.vertical + ' '.repeat(width - 2) + style.vertical;
    lines.push(middleLine);
  }
  
  const bottomLine = style.bottomLeft + style.horizontal.repeat(width - 2) + style.bottomRight;
  lines.push(bottomLine);
  
  return lines;
}

export function centerText(text: string, width: number): string {
  const padding = Math.max(0, width - text.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

export function truncate(text: string, maxWidth: number, suffix: string = '...'): string {
  if (text.length <= maxWidth) return text;
  return text.substring(0, maxWidth - suffix.length) + suffix;
}