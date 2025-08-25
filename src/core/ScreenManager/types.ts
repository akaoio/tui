/**
 * Types and interfaces for ScreenManager
 */

/**
 * ANSI escape codes for terminal control
 */
export const ANSI = {
  // Cursor movement
  cursorUp: (n = 1) => `\x1b[${n}A`,
  cursorDown: (n = 1) => `\x1b[${n}B`,
  cursorForward: (n = 1) => `\x1b[${n}C`,
  cursorBack: (n = 1) => `\x1b[${n}D`,
  cursorNextLine: (n = 1) => `\x1b[${n}E`,
  cursorPrevLine: (n = 1) => `\x1b[${n}F`,
  cursorPosition: (row: number, col: number) => `\x1b[${row};${col}H`,
  cursorColumn: (col: number) => `\x1b[${col}G`,
  
  // Screen control
  clearScreen: '\x1b[2J',
  clearLine: '\x1b[2K',
  clearToEndOfLine: '\x1b[0K',
  clearToBeginOfLine: '\x1b[1K',
  
  // Alternative screen buffer (for full-screen apps)
  alternateScreenEnter: '\x1b[?1049h',
  alternateScreenExit: '\x1b[?1049l',
  
  // Cursor visibility
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h',
  
  // Save/restore cursor
  saveCursor: '\x1b7',
  restoreCursor: '\x1b8',
  
  // Scrolling
  scrollUp: '\x1b[S',
  scrollDown: '\x1b[T',
  
  // Mouse support
  mouseTrackingOn: '\x1b[?1000h\x1b[?1006h',
  mouseTrackingOff: '\x1b[?1000l\x1b[?1006l',
  
  // Colors and styles
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  strikethrough: '\x1b[9m',
};

/**
 * Mouse event types
 */
export enum MouseEventType {
  PRESS = 'press',
  RELEASE = 'release',
  MOVE = 'move',
  SCROLL_UP = 'scrollUp',
  SCROLL_DOWN = 'scrollDown',
}

/**
 * Mouse button types
 */
export enum MouseButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  NONE = 3,
}

/**
 * Mouse event data
 */
export interface MouseEvent {
  type: MouseEventType;
  button: MouseButton;
  x: number;
  y: number;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
}

/**
 * Screen buffer cell
 */
export interface Cell {
  char: string;
  style?: string;
}

/**
 * Component information for mouse event routing
 */
export interface ComponentInfo {
  component: any;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Screen dimensions
 */
export interface ScreenDimensions {
  width: number;
  height: number;
}

/**
 * Region definition for component placement
 */
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}