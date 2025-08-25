/**
 * Move cursor left function
 */

import { InputState } from '../types';

export function moveCursorLeft(this: any, state: InputState, multiline: boolean): void {
  if (state.cursorPosition > 0) {
    state.cursorPosition--;
  } else if (multiline && state.currentLine > 0) {
    state.currentLine--;
    state.cursorPosition = state.lines[state.currentLine]?.length || 0;
  }
}