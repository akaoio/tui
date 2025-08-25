/**
 * Rendering logic for Select component
 */

import { Screen } from '../../core/screen';
import { Color, color, reset, BgColor } from '../../utils/colors';
import { SelectOption, SelectState } from './types';

export class SelectRenderer {
  constructor(private screen: Screen) {}

  renderClosed(
    x: number,
    y: number,
    width: number,
    options: SelectOption[],
    state: SelectState,
    focused: boolean
  ): void {
    const selectedOption = options[state.selectedIndex];
    const label = selectedOption ? selectedOption.label : 'Select...';
    const maxLabelWidth = width - 3; // Account for dropdown arrow and space
    
    let text = '';
    
    if (focused) {
      text += color(Color.Cyan);
    }
    
    // Truncate label if too long
    let displayLabel = label;
    if (label.length > maxLabelWidth) {
      displayLabel = label.substring(0, maxLabelWidth - 3) + '...';
    }
    
    text += '▼ ' + displayLabel;
    
    // Add padding to clear previous content
    const textLength = displayLabel.length + 2;
    if (textLength < width) {
      text += ' '.repeat(width - textLength);
    }
    
    text += reset();
    
    this.screen.writeAt(x, y, text);
  }

  renderOpen(
    x: number,
    y: number,
    width: number,
    options: SelectOption[],
    state: SelectState,
    maxDisplay: number,
    multiple: boolean
  ): number {
    const displayCount = Math.min(options.length, maxDisplay);
    
    this.screen.writeAt(x, y, '▲ Select option' + ' '.repeat(width - 15));
    
    this.screen.writeAt(x, y + 1, '┌' + '─'.repeat(width - 2) + '┐');
    
    const visibleOptions = options.slice(state.scrollOffset, state.scrollOffset + displayCount);
    
    visibleOptions.forEach((option, index) => {
      const actualIndex = state.scrollOffset + index;
      const isHovered = actualIndex === state.hoveredIndex;
      const isSelected = multiple 
        ? state.selectedIndices.has(actualIndex)
        : actualIndex === state.selectedIndex;
      
      let line = '│ ';
      
      if (multiple) {
        line += isSelected ? '[✓] ' : '[ ] ';
      } else {
        line += isSelected ? '● ' : '○ ';
      }
      
      let optionText = option.label;
      const prefixLength = multiple ? 6 : 4; // Length of checkbox/radio + space
      const maxTextWidth = width - prefixLength - 2; // Account for borders
      
      // Truncate option text if too long
      if (optionText.length > maxTextWidth) {
        optionText = optionText.substring(0, maxTextWidth - 3) + '...';
      }
      
      if (option.disabled) {
        optionText = color(Color.BrightBlack) + optionText + reset();
      } else if (isHovered) {
        optionText = color(Color.Black, BgColor.Cyan) + optionText + reset();
      } else if (isSelected && !multiple) {
        optionText = color(Color.Cyan) + optionText + reset();
      }
      
      line += optionText;
      
      const lineLength = this.stripAnsi(line).length;
      if (lineLength < width - 1) {
        line += ' '.repeat(width - lineLength - 1);
      }
      
      line += '│';
      
      this.screen.writeAt(x, y + 2 + index, line);
    });
    
    this.screen.writeAt(x, y + 2 + displayCount, '└' + '─'.repeat(width - 2) + '┘');
    
    if (options.length > maxDisplay) {
      const scrollbarHeight = Math.max(1, Math.floor(displayCount * displayCount / options.length));
      const scrollbarPosition = Math.floor(state.scrollOffset * displayCount / options.length);
      
      for (let i = 0; i < displayCount; i++) {
        const char = i >= scrollbarPosition && i < scrollbarPosition + scrollbarHeight ? '█' : '│';
        this.screen.writeAt(x + width - 1, y + 2 + i, char);
      }
    }
    
    return displayCount + 3; // Return height
  }

  clearArea(x: number, y: number, width: number, height: number): void {
    for (let i = 0; i < height; i++) {
      this.screen.writeAt(x, y + i, ' '.repeat(width));
    }
  }

  private stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }
}