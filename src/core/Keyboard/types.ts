/**
 * Keyboard types
 */

export enum Key {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  ENTER = 'return',
  ESCAPE = 'escape',
  SPACE = 'space',
  TAB = 'tab',
  BACKSPACE = 'backspace',
  DELETE = 'delete',
  HOME = 'home',
  END = 'end',
  PAGEUP = 'pageup',
  PAGEDOWN = 'pagedown',
  CTRL_C = 'ctrl+c',
  CTRL_D = 'ctrl+d',
  CTRL_Z = 'ctrl+z',
  CTRL_L = 'ctrl+l',
}

export interface KeyEvent {
  name: string;
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  sequence: string;
}