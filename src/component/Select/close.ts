/**
 * Select close method
 */

import { clear } from './clear';

export function close(this: any): void {
  this.state.isOpen = false;
  this.height = 1;
  clear.call(this);
  this.emit('close');
}