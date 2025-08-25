/**
 * Mouse handling methods for ScreenManager
 */

import { MouseEvent, MouseEventType, MouseButton } from './types';

/**
 * Parse SGR mouse sequence
 */
export function parseSGRMouse(this: any, sequence: string): MouseEvent | null {
  // SGR format: \x1b[<button;x;y;M (press) or m (release)
  const match = sequence.match(/^\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
  if (!match) return null;
  
  const buttonCode = parseInt(match[1]);
  const x = parseInt(match[2]) - 1; // Convert to 0-based
  const y = parseInt(match[3]) - 1;
  const isRelease = match[4] === 'm';
  
  // Parse button and modifiers
  const button = buttonCode & 0x03;
  const shift = !!(buttonCode & 0x04);
  const meta = !!(buttonCode & 0x08);
  const ctrl = !!(buttonCode & 0x10);
  const motion = !!(buttonCode & 0x20);
  const wheel = !!(buttonCode & 0x40);
  
  let type: MouseEventType;
  let mouseButton: MouseButton;
  
  if (wheel) {
    // Scroll events
    type = button === 0 ? MouseEventType.SCROLL_UP : MouseEventType.SCROLL_DOWN;
    mouseButton = MouseButton.NONE;
  } else if (motion) {
    type = MouseEventType.MOVE;
    mouseButton = button as MouseButton;
  } else {
    type = isRelease ? MouseEventType.RELEASE : MouseEventType.PRESS;
    mouseButton = button as MouseButton;
  }
  
  return {
    type,
    button: mouseButton,
    x,
    y,
    ctrl,
    shift,
    meta
  };
}

/**
 * Enable mouse tracking
 */
export function enableMouseTracking(write: (data: string) => void): void {
  // Enable SGR mouse mode with click tracking
  write('\x1b[?1000h\x1b[?1006h');
}

/**
 * Disable mouse tracking
 */
export function disableMouseTracking(write: (data: string) => void): void {
  write('\x1b[?1000l\x1b[?1006l');
}

/**
 * Check if a sequence is a mouse event
 */
export function isMouseSequence(this: any, sequence: string): boolean {
  return sequence.startsWith('\x1b[<');
}