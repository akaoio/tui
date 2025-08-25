/**
 * Single line input rendering logic
 */

import { Screen } from '../../core/screen';
import { Color, color, reset } from '../../utils/colors';
import { underline } from '../../utils/styles';
import { InputState } from './types';

export function renderSingleLine(this: any, screen: Screen,
  x: number,
  y: number,
  width: number | undefined,
  state: InputState,
  placeholder: string,
  password: boolean,
  focused: boolean): void {
  const displayValue = password ? '*'.repeat(state.value.length) : state.value;
  const displayText = displayValue || placeholder;
  const isPlaceholder = !state.value && placeholder;
  
  let text = '';
  
  if (focused) {
    text += color(Color.Cyan);
  }
  
  if (isPlaceholder) {
    text += color(Color.BrightBlack);
  }
  
  const maxWidth = width || Math.min(40, screen.getWidth() - x);
  let visibleText = displayText;
  
  // Improved scrolling logic for long text
  if (displayText.length > maxWidth - 1) {
    // Keep cursor visible with better scrolling
    if (focused && !isPlaceholder) {
      if (state.cursorPosition >= state.scrollOffset + maxWidth - 1) {
        state.scrollOffset = state.cursorPosition - maxWidth + 2;
      } else if (state.cursorPosition < state.scrollOffset) {
        state.scrollOffset = state.cursorPosition;
      }
    }
    visibleText = displayText.substring(state.scrollOffset, state.scrollOffset + maxWidth - 1);
  } else {
    state.scrollOffset = 0;
  }
  
  if (focused && !isPlaceholder) {
    const cursorPos = state.cursorPosition - state.scrollOffset;
    if (cursorPos >= 0 && cursorPos <= visibleText.length) {
      const before = visibleText.substring(0, cursorPos);
      const at = visibleText[cursorPos] || ' ';
      const after = visibleText.substring(cursorPos + 1);
      text += before + underline(at) + after;
    } else {
      text += visibleText;
    }
  } else {
    text += visibleText;
  }
  
  text += reset();
  
  if (text.length < maxWidth) {
    text += ' '.repeat(maxWidth - visibleText.length);
  }
  
  screen.writeAt(x, y, text);
  
  if (state.error) {
    screen.writeAt(
      x,
      y + 1,
      color(Color.Red) + state.error + reset()
    );
  }
}