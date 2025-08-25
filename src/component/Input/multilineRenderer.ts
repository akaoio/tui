/**
 * Multiline input rendering logic
 */

import { Screen } from '../../core/screen';
import { underline } from '../../utils/styles';
import { InputState } from './types';

export function renderMultiline(this: any, screen: Screen,
  x: number,
  y: number,
  width: number,
  height: number,
  state: InputState,
  password: boolean,
  focused: boolean): void {
  const boxWidth = width;
  const boxHeight = height;
  const contentWidth = boxWidth - 4; // Account for borders and padding
  
  // Draw box
  screen.writeAt(x, y, '┌' + '─'.repeat(boxWidth - 2) + '┐');
  
  for (let i = 1; i < boxHeight - 1; i++) {
    screen.writeAt(x, y + i, '│' + ' '.repeat(boxWidth - 2) + '│');
  }
  
  screen.writeAt(x, y + boxHeight - 1, '└' + '─'.repeat(boxWidth - 2) + '┘');
  
  const visibleLines = boxHeight - 2;
  const startLine = Math.max(0, state.currentLine - visibleLines + 1);
  
  for (let i = 0; i < visibleLines && startLine + i < state.lines.length; i++) {
    const lineIndex = startLine + i;
    const line = state.lines[lineIndex] || '';
    const displayLine = password ? '*'.repeat(line.length) : line;
    
    let text = '';
    let lineScrollOffset = 0;
    
    // Handle horizontal scrolling per line
    if (focused && lineIndex === state.currentLine) {
      // Calculate scroll offset for current line
      if (state.cursorPosition > contentWidth - 1) {
        lineScrollOffset = state.cursorPosition - contentWidth + 1;
      }
      
      const visibleLine = displayLine.substring(lineScrollOffset, lineScrollOffset + contentWidth);
      const adjustedCursorPos = state.cursorPosition - lineScrollOffset;
      
      if (adjustedCursorPos >= 0 && adjustedCursorPos <= visibleLine.length) {
        const before = visibleLine.substring(0, adjustedCursorPos);
        const at = visibleLine[adjustedCursorPos] || ' ';
        const after = visibleLine.substring(adjustedCursorPos + 1);
        text = before + underline(at) + after;
      } else {
        text = visibleLine;
      }
    } else {
      // For non-focused lines, truncate with ellipsis if too long
      if (displayLine.length > contentWidth) {
        text = displayLine.substring(0, contentWidth - 3) + '...';
      } else {
        text = displayLine;
      }
    }
    
    // Ensure text doesn't overflow
    if (text.length > contentWidth) {
      text = text.substring(0, contentWidth);
    }
    
    // Write with padding to clear previous content
    const padding = ' '.repeat(Math.max(0, contentWidth - text.length));
    screen.writeAt(x + 2, y + i + 1, text + padding);
  }
}