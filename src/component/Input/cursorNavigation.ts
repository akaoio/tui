/**
 * Cursor navigation logic for Input component
 */

import { InputState } from './types';

export function moveCursorLeft(this: any, state: InputState, multiline: boolean): void {
  if (state.cursorPosition > 0) {
    state.cursorPosition--;
  } else if (multiline && state.currentLine > 0) {
    state.currentLine--;
    state.cursorPosition = state.lines[state.currentLine]?.length || 0;
  }
}

export function moveCursorRight(this: any, state: InputState, multiline: boolean): void {
  if (multiline) {
    const currentLineLength = state.lines[state.currentLine]?.length || 0;
    if (state.cursorPosition < currentLineLength) {
      state.cursorPosition++;
    } else if (state.currentLine < state.lines.length - 1) {
      state.currentLine++;
      state.cursorPosition = 0;
    }
  } else {
    if (state.cursorPosition < state.value.length) {
      state.cursorPosition++;
    }
  }
}

export function moveCursorUp(this: any, state: InputState): void {
  if (state.currentLine > 0) {
    state.currentLine--;
    const lineLength = state.lines[state.currentLine]?.length || 0;
    state.cursorPosition = Math.min(state.cursorPosition, lineLength);
  }
}

export function moveCursorDown(this: any, state: InputState): void {
  if (state.currentLine < state.lines.length - 1) {
    state.currentLine++;
    const lineLength = state.lines[state.currentLine]?.length || 0;
    state.cursorPosition = Math.min(state.cursorPosition, lineLength);
  }
}

export function moveCursorToHome(this: any, state: InputState): void {
  state.cursorPosition = 0;
}

export function moveCursorToEnd(this: any, state: InputState, multiline: boolean): void {
  if (multiline) {
    state.cursorPosition = state.lines[state.currentLine]?.length || 0;
  } else {
    state.cursorPosition = state.value.length;
  }
}