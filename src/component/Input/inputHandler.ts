/**
 * Input handling logic (backspace, delete, character insertion)
 */

import { InputState } from './types';

export function handleBackspace(this: any, state: InputState, multiline: boolean): void {
  if (multiline) {
    const line = state.lines[state.currentLine] || '';
    if (state.cursorPosition > 0) {
      state.lines[state.currentLine] = 
        line.substring(0, state.cursorPosition - 1) + 
        line.substring(state.cursorPosition);
      state.cursorPosition--;
    } else if (state.currentLine > 0) {
      const prevLine = state.lines[state.currentLine - 1] || '';
      state.cursorPosition = prevLine.length;
      state.lines[state.currentLine - 1] = prevLine + line;
      state.lines.splice(state.currentLine, 1);
      state.currentLine--;
    }
    state.value = state.lines.join('\n');
  } else {
    if (state.cursorPosition > 0) {
      state.value = 
        state.value.substring(0, state.cursorPosition - 1) + 
        state.value.substring(state.cursorPosition);
      state.cursorPosition--;
    }
  }
}

export function handleDelete(this: any, state: InputState, multiline: boolean): void {
  if (multiline) {
    const line = state.lines[state.currentLine] || '';
    if (state.cursorPosition < line.length) {
      state.lines[state.currentLine] = 
        line.substring(0, state.cursorPosition) + 
        line.substring(state.cursorPosition + 1);
    } else if (state.currentLine < state.lines.length - 1) {
      state.lines[state.currentLine] = line + (state.lines[state.currentLine + 1] || '');
      state.lines.splice(state.currentLine + 1, 1);
    }
    state.value = state.lines.join('\n');
  } else {
    if (state.cursorPosition < state.value.length) {
      state.value = 
        state.value.substring(0, state.cursorPosition) + 
        state.value.substring(state.cursorPosition + 1);
    }
  }
}

export function handleNewLine(this: any, state: InputState): void {
  const line = state.lines[state.currentLine] || '';
  const before = line.substring(0, state.cursorPosition);
  const after = line.substring(state.cursorPosition);
  state.lines[state.currentLine] = before;
  state.lines.splice(state.currentLine + 1, 0, after);
  state.currentLine++;
  state.cursorPosition = 0;
  state.value = state.lines.join('\n');
}

export function insertChar(this: any, state: InputState, char: string, maxLength: number, multiline: boolean): boolean {
  if (state.value.length >= maxLength) return false;
  
  if (multiline) {
    const line = state.lines[state.currentLine] || '';
    state.lines[state.currentLine] = 
      line.substring(0, state.cursorPosition) + 
      char + 
      line.substring(state.cursorPosition);
    state.cursorPosition++;
    state.value = state.lines.join('\n');
  } else {
    state.value = 
      state.value.substring(0, state.cursorPosition) + 
      char + 
      state.value.substring(state.cursorPosition);
    state.cursorPosition++;
  }
  
  return true;
}