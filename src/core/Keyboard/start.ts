import * as readline from 'readline';
import { handleKeypress } from './handleKeypress';

/**
 * Start keyboard listener
 */
export function start(this: any): void {
  if (this.rl) return;

  if (this.stdin.isTTY) {
    this.stdin.setRawMode(true);
    this.rawMode = true;
  }

  readline.emitKeypressEvents(this.stdin);
  this.stdin.resume();

  this.stdin.on('keypress', handleKeypress.bind(this));
  this.rl = {}; // Mark as started (original code never actually used rl as readline interface)
}