/**
 * ScreenManager constructor logic
 */

import { EventEmitter } from 'events';
import { OutputFilter } from '../OutputFilter';
import { VirtualCursorManager } from '../VirtualCursor';
import { createBuffer } from './bufferManagement';
import { setupTerminal } from './setupTerminal';

export function constructor(this: any): void {
  EventEmitter.call(this);
  
  this.stdin = process.stdin;
  this.stdout = process.stdout;
  
  // Initialize dimensions
  this.width = this.stdout.columns || 80;
  this.height = this.stdout.rows || 24;
  
  // Initialize buffer
  this.buffer = createBuffer(this.width, this.height);
  this.prevBuffer = null;
  this.cursorX = 0;
  this.cursorY = 0;
  this.cursorVisible = true;
  this.isAlternateScreen = false;
  this.isMouseEnabled = false;
  this.isRawMode = false;
  this.components = new Map();
  this.inputBuffer = '';
  this.cursorMode = false;
  
  // Initialize output filter
  this.outputFilter = OutputFilter.getInstance();
  
  // Initialize virtual cursor manager
  this.virtualCursorManager = VirtualCursorManager.getInstance();
  this.virtualCursorManager.initialize(this);
  
  // Setup terminal
  setupTerminal.call(this);
}