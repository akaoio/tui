import { EventEmitter } from 'events';

/**
 * Constructor logic for Keyboard class
 */
export function constructor(this: any, stdin: NodeJS.ReadStream = process.stdin) {
  EventEmitter.call(this);
  this.stdin = stdin;
  this.rl = null;
  this.rawMode = false;
}