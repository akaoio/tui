import readline from 'readline';
import { EventEmitter } from 'events';

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

export class Keyboard extends EventEmitter {
  private rl: readline.Interface | null = null;
  private stdin: NodeJS.ReadStream;
  private rawMode: boolean = false;

  constructor(stdin: NodeJS.ReadStream = process.stdin) {
    super();
    this.stdin = stdin;
  }

  start(): void {
    if (this.rl) return;

    if (this.stdin.isTTY) {
      this.stdin.setRawMode(true);
      this.rawMode = true;
    }

    readline.emitKeypressEvents(this.stdin);
    this.stdin.resume();

    this.stdin.on('keypress', this.handleKeypress.bind(this));
  }

  stop(): void {
    if (this.rawMode && this.stdin.isTTY) {
      this.stdin.setRawMode(false);
    }
    this.stdin.pause();
    this.stdin.removeAllListeners('keypress');
    this.rl = null;
  }

  private handleKeypress(str: string, key: readline.Key): void {
    if (!key) return;

    const keyEvent: KeyEvent = {
      name: key.name || '',
      key: str || '',
      ctrl: key.ctrl || false,
      meta: key.meta || false,
      shift: key.shift || false,
      sequence: key.sequence || '',
    };

    if (key.ctrl && key.name === 'c') {
      this.emit('key', Key.CTRL_C, keyEvent);
      this.stop();
      process.exit(0);
    }

    const keyMap: { [key: string]: Key } = {
      up: Key.UP,
      down: Key.DOWN,
      left: Key.LEFT,
      right: Key.RIGHT,
      return: Key.ENTER,
      escape: Key.ESCAPE,
      space: Key.SPACE,
      tab: Key.TAB,
      backspace: Key.BACKSPACE,
      delete: Key.DELETE,
      home: Key.HOME,
      end: Key.END,
      pageup: Key.PAGEUP,
      pagedown: Key.PAGEDOWN,
    };

    const mappedKey = keyMap[key.name || ''];
    if (mappedKey) {
      this.emit('key', mappedKey, keyEvent);
    } else if (str) {
      this.emit('char', str, keyEvent);
    }

    this.emit('keypress', keyEvent);
  }

  onKey(callback: (key: Key, event: KeyEvent) => void): void {
    this.on('key', callback);
  }

  onChar(callback: (char: string, event: KeyEvent) => void): void {
    this.on('char', callback);
  }

  onKeypress(callback: (event: KeyEvent) => void): void {
    this.on('keypress', callback);
  }
}