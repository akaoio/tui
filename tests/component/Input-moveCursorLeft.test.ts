/**
 * Test suite for Input moveCursorLeft function
 */

import { moveCursorLeft } from '../../src/component/Input/cursorNavigation/moveCursorLeft';
import { InputState } from '../../src/component/Input/types';

describe('moveCursorLeft', () => {
  let mockState: InputState;

  beforeEach(() => {
    mockState = {
      value: 'hello world',
      cursorPosition: 5,
      scrollOffset: 0,
      lines: ['hello world'],
      currentLine: 0,
      error: null
    };
  });

  describe('single-line mode', () => {
    test('should move cursor left when position > 0', () => {
      moveCursorLeft.call(null, mockState, false);
      
      expect(mockState.cursorPosition).toBe(4);
    });

    test('should not move cursor left when at position 0', () => {
      mockState.cursorPosition = 0;
      
      moveCursorLeft.call(null, mockState, false);
      
      expect(mockState.cursorPosition).toBe(0);
    });

    test('should not change currentLine in single-line mode', () => {
      const originalLine = mockState.currentLine;
      
      moveCursorLeft.call(null, mockState, false);
      
      expect(mockState.currentLine).toBe(originalLine);
    });
  });

  describe('multiline mode', () => {
    beforeEach(() => {
      mockState.lines = ['first line', 'second line', 'third line'];
      mockState.currentLine = 1;
      mockState.cursorPosition = 0;
    });

    test('should move cursor left when position > 0', () => {
      mockState.cursorPosition = 5;
      
      moveCursorLeft.call(null, mockState, true);
      
      expect(mockState.cursorPosition).toBe(4);
      expect(mockState.currentLine).toBe(1);
    });

    test('should move to previous line when at position 0 and currentLine > 0', () => {
      mockState.cursorPosition = 0;
      mockState.currentLine = 1;
      
      moveCursorLeft.call(null, mockState, true);
      
      expect(mockState.currentLine).toBe(0);
      expect(mockState.cursorPosition).toBe(10); // Length of 'first line'
    });

    test('should handle empty previous line', () => {
      mockState.lines = ['', 'second line'];
      mockState.cursorPosition = 0;
      mockState.currentLine = 1;
      
      moveCursorLeft.call(null, mockState, true);
      
      expect(mockState.currentLine).toBe(0);
      expect(mockState.cursorPosition).toBe(0);
    });

    test('should not move when at position 0 and currentLine is 0', () => {
      mockState.cursorPosition = 0;
      mockState.currentLine = 0;
      
      moveCursorLeft.call(null, mockState, true);
      
      expect(mockState.cursorPosition).toBe(0);
      expect(mockState.currentLine).toBe(0);
    });

    test('should handle undefined line length', () => {
      mockState.lines = ['first line'];
      mockState.cursorPosition = 0;
      mockState.currentLine = 1;
      
      moveCursorLeft.call(null, mockState, true);
      
      expect(mockState.currentLine).toBe(0);
      expect(mockState.cursorPosition).toBe(10); // 'first line' has 10 characters
    });
  });
});