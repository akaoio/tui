import { EventEmitter } from 'events';
import * as readline from 'readline';
import { constructor } from './constructor';
import { start } from './start';
import { stop } from './stop';
import { onKey } from './onKey';
import { onChar } from './onChar';
import { onKeypress } from './onKeypress';
import { Key, KeyEvent } from './types';

/**
 * Keyboard class - Container with method delegation only
 */
export class Keyboard extends EventEmitter {
  private rl: readline.Interface | null = null;
  private stdin!: NodeJS.ReadStream; // Initialized by constructor function
  private rawMode: boolean = false;

  constructor(stdin: NodeJS.ReadStream = process.stdin) {
    super();
    constructor.call(this, stdin);
  }

  start(): void {
    return start.call(this);
  }

  stop(): void {
    return stop.call(this);
  }

  onKey(callback: (key: Key, event: KeyEvent) => void): void {
    return onKey.call(this, callback);
  }

  onChar(callback: (char: string, event: KeyEvent) => void): void {
    return onChar.call(this, callback);
  }

  onKeypress(callback: (event: KeyEvent) => void): void {
    return onKeypress.call(this, callback);
  }
}