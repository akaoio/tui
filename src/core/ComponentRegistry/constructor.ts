/**
 * ComponentRegistry constructor logic
 */

import { EventEmitter } from 'events';

export function constructor(this: any): void {
  EventEmitter.call(this);
  
  this.components = new Map();
  this.componentsByType = new Map();
  this.componentTree = new Map();
  this.mountedComponents = new Set();
}