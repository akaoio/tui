/**
 * ScreenManager setupTerminal method
 */

import * as readline from 'readline';
import { handleResize } from './handleResize';
import { handleInput } from './handleInput';
import { cleanup } from './cleanup';

export function setupTerminal(this: any): void {
  // Handle resize
  this.stdout.on('resize', () => {
    handleResize.call(this);
  });
  
  // Setup readline interface
  this.rl = readline.createInterface({
    input: this.stdin,
    output: this.stdout,
    terminal: true
  });
  
  // Enable raw mode for immediate input
  if (this.stdin.isTTY) {
    this.stdin.setRawMode(true);
    this.isRawMode = true;
  }
  
  // Handle input
  this.stdin.on('data', (data: Buffer) => {
    handleInput.call(this, data);
  });
  
  // Handle exit
  process.on('exit', () => {
    cleanup.call(this);
  });
  
  // Handle interrupt
  process.on('SIGINT', () => {
    cleanup.call(this);
    process.exit(0);
  });
}